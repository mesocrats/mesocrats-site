"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Circle, CheckCircle, X } from "lucide-react";
import { useSocialAuth } from "../../components/SocialAuthProvider";

interface CalendarPost {
  id: string;
  content: string;
  platform: string;
  post_category: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const platformBadge: Record<string, { bg: string; text: string; label: string }> = {
  twitter: { bg: "bg-[#6B7280]", text: "text-white", label: "X" },
  linkedin: { bg: "bg-[#4374BA]", text: "text-white", label: "Li" },
  instagram: { bg: "bg-[#6C3393]", text: "text-white", label: "Ig" },
};

const platformBorder: Record<string, string> = {
  twitter: "border-l-[#6B7280]",
  linkedin: "border-l-[#4374BA]",
  instagram: "border-l-[#6C3393]",
};

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeEST(isoString: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const estHour = (d.getUTCHours() - 5 + 24) % 24;
  const ampm = estHour >= 12 ? "PM" : "AM";
  const displayHour = estHour === 0 ? 12 : estHour > 12 ? estHour - 12 : estHour;
  return `${displayHour}:00 ${ampm}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for mobile/older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

export default function CalendarPage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingPublish, setTogglingPublish] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const start = weekDates[0].toISOString();
      const end = new Date(weekDates[6].getTime() + 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(
        `/api/posts?scheduled_after=${start}&scheduled_before=${end}&limit=100`
      );
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.posts || []).filter((p: CalendarPost) =>
          ["approved", "scheduled", "published"].includes(p.status)
        );
        setPosts(filtered);
      }
    } catch {
      // silent
    } finally {
      setLoadingPosts(false);
    }
  }, [user, weekDates]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const togglePublish = useCallback(
    async (post: CalendarPost, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session) return;

      setTogglingPublish((prev) => new Set(prev).add(post.id));

      const newStatus = post.status === "published" ? "approved" : "published";

      try {
        const res = await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          const data = await res.json();
          setPosts((prev) =>
            prev.map((p) => (p.id === post.id ? { ...p, ...data.post } : p))
          );
          if (selectedPost?.id === post.id) {
            setSelectedPost((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        }
      } catch {
        // silent
      } finally {
        setTogglingPublish((prev) => {
          const next = new Set(prev);
          next.delete(post.id);
          return next;
        });
      }
    },
    [session, selectedPost]
  );

  async function handleCopy(postId: string, content: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date();

  const monthLabel = (() => {
    const months = new Set(weekDates.map((d) => d.toLocaleString("en-US", { month: "long", year: "numeric" })));
    return Array.from(months).join(" / ");
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-gray-400 mt-1">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          const dayPosts = posts.filter((p) => {
            const postDate = p.scheduled_at
              ? new Date(p.scheduled_at)
              : new Date(p.created_at);
            return isSameDay(postDate, date);
          });

          return (
            <div
              key={i}
              className={`min-h-[180px] rounded-xl border p-2 ${
                isToday
                  ? "border-[#4374BA]/40 bg-[#4374BA]/5"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{DAYS[i]}</span>
                <div className="flex items-center gap-1.5">
                  {dayPosts.length > 0 && (
                    <span className="text-[9px] font-medium text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                      {dayPosts.length}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isToday ? "text-[#4374BA]" : "text-gray-400"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-1.5">
                {loadingPosts ? (
                  <div className="h-8 bg-white/[0.04] rounded animate-pulse" />
                ) : (
                  dayPosts.map((post) => {
                    const badge = platformBadge[post.platform] || platformBadge.twitter;
                    const borderColor = platformBorder[post.platform] || "border-l-gray-500";
                    const isPublished = post.status === "published";
                    const isToggling = togglingPublish.has(post.id);
                    const isCopied = copiedId === post.id;
                    const timeLabel = formatTimeEST(post.scheduled_at);

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`group relative p-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] border-l-2 ${borderColor} hover:bg-white/[0.06] cursor-pointer transition-colors`}
                      >
                        {/* Row 1: badge + time + actions */}
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}
                            >
                              {badge.label}
                            </span>
                            {timeLabel && (
                              <span className="text-[9px] text-gray-500">
                                {timeLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleCopy(post.id, post.content, e)}
                              title={isCopied ? "Copied!" : "Copy content"}
                              className="transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={(e) => togglePublish(post, e)}
                              disabled={isToggling}
                              title={isPublished ? "Mark as unposted" : "Mark as posted"}
                              className="transition-colors disabled:opacity-50"
                            >
                              {isToggling ? (
                                <span className="w-3.5 h-3.5 border border-gray-500 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : isPublished ? (
                                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Row 2: content preview */}
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                          {post.content.slice(0, 100)}
                          {post.content.length > 100 ? "..." : ""}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0B0F1A] border border-white/[0.1] rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = platformBadge[selectedPost.platform] || platformBadge.twitter;
                  return (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  );
                })()}
                {selectedPost.scheduled_at && (
                  <span className="text-xs text-gray-500">
                    {formatTimeEST(selectedPost.scheduled_at)} EST
                  </span>
                )}
                {selectedPost.post_category && (
                  <span className="text-xs text-gray-500">
                    {selectedPost.post_category.replace(/_/g, " ")}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedPost.status === "published"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-[#4374BA]/10 text-[#4374BA]"
                  }`}
                >
                  {selectedPost.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {selectedPost.content}
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/[0.06]">
              <button
                onClick={(e) => togglePublish(selectedPost, e)}
                disabled={togglingPublish.has(selectedPost.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  selectedPost.status === "published"
                    ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                    : "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {selectedPost.status === "published" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                {selectedPost.status === "published" ? "Posted" : "Mark as Posted"}
              </button>

              <button
                onClick={() => handleCopy(selectedPost.id, selectedPost.content)}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[#4374BA] hover:bg-[#4374BA]/80 rounded-lg transition-colors"
              >
                {copiedId === selectedPost.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

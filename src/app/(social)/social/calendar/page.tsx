"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Circle, CheckCircle, X, Plus, Trash2 } from "lucide-react";
import { useSocialAuth } from "../../components/SocialAuthProvider";

interface CalendarPost {
  id: string;
  content: string;
  platform: string;
  category: string | null;
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

const TWITTER_TIME_SLOTS = [
  { label: "10:00 AM EST", hourUTC: 15 },
  { label: "1:00 PM EST", hourUTC: 18 },
  { label: "4:00 PM EST", hourUTC: 21 },
];

const LINKEDIN_TIME_SLOT = { label: "9:00 AM EST", hourUTC: 14 };

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

  // Edit modal state
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New post modal state
  const [newPostDate, setNewPostDate] = useState<Date | null>(null);
  const [newPostPlatform, setNewPostPlatform] = useState<"linkedin" | "twitter">("twitter");
  const [newPostTimeSlot, setNewPostTimeSlot] = useState(0);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostSaving, setNewPostSaving] = useState(false);
  const [newPostError, setNewPostError] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Open detail modal
  function openPostDetail(post: CalendarPost) {
    setSelectedPost(post);
    setEditContent(post.content);
    setSaved(false);
  }

  // Save edited content
  async function handleSaveEdit() {
    if (!selectedPost || !session) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPost.id ? { ...p, ...data.post } : p))
        );
        setSelectedPost((prev) => (prev ? { ...prev, content: editContent } : null));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

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

  async function handleDeletePost() {
    if (!selectedPost || !session) return;
    setDeleting(true);
    try {
      // Mark generation metadata as available for reuse before deleting
      await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          generation_metadata: { deleted_for_reuse: true, deleted_at: new Date().toISOString() },
        }),
      });

      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
        setSelectedPost(null);
        setShowDeleteConfirm(false);
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  }

  // New post modal
  function openNewPostModal(date: Date) {
    setNewPostDate(date);
    setNewPostPlatform("twitter");
    setNewPostTimeSlot(0);
    setNewPostContent("");
    setNewPostError(null);
  }

  async function handleCreatePost() {
    if (!newPostDate || !session || !newPostContent.trim()) return;
    setNewPostSaving(true);
    setNewPostError(null);

    const hourUTC =
      newPostPlatform === "linkedin"
        ? LINKEDIN_TIME_SLOT.hourUTC
        : TWITTER_TIME_SLOTS[newPostTimeSlot]?.hourUTC ?? 12;

    const scheduled = new Date(
      Date.UTC(
        newPostDate.getFullYear(),
        newPostDate.getMonth(),
        newPostDate.getDate(),
        hourUTC,
        0,
        0
      )
    );

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: newPostContent.trim(),
          platform: newPostPlatform,
          category: newPostPlatform === "linkedin" ? "tech_story" : "current_events",
          status: "approved",
          scheduled_at: scheduled.toISOString(),
          platform_post_id: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setNewPostError(data?.error || `Failed (${res.status})`);
        return;
      }

      const data = await res.json();
      setPosts((prev) => [...prev, data.post]);
      setNewPostDate(null);
    } catch (err) {
      setNewPostError(err instanceof Error ? err.message : "Network error");
    } finally {
      setNewPostSaving(false);
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
                  <button
                    onClick={() => openNewPostModal(date)}
                    title="Add post"
                    className="w-4 h-4 flex items-center justify-center rounded bg-white/[0.06] hover:bg-white/[0.12] text-gray-500 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
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
                        onClick={() => openPostDetail(post)}
                        className={`group relative p-1.5 rounded-md border border-l-2 ${borderColor} cursor-pointer transition-colors ${
                          isPublished
                            ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                            : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
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

                        {/* Published badge */}
                        {isPublished && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-green-400 bg-green-500/10 px-1 py-0.5 rounded mb-0.5">
                            <Check className="w-2 h-2" />
                            Published
                          </span>
                        )}

                        {/* Row 2: content preview */}
                        <p className={`text-[10px] line-clamp-2 leading-tight ${
                          isPublished ? "text-gray-500" : "text-gray-400"
                        }`}>
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

      {/* Post Detail / Edit Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setSelectedPost(null); setShowDeleteConfirm(false); }}
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
                {selectedPost.category && (
                  <span className="text-xs text-gray-500">
                    {selectedPost.category.replace(/_/g, " ")}
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
                onClick={() => { setSelectedPost(null); setShowDeleteConfirm(false); }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body — editable */}
            <div className="p-4 overflow-y-auto flex-1">
              <textarea
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  setSaved(false);
                }}
                rows={Math.max(5, editContent.split("\n").length + 2)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-200 leading-relaxed focus:outline-none focus:border-[#4374BA]/50 resize-y"
              />
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-white/[0.06]">
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-400">
                    Delete this post? This cannot be undone.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeletePost}
                      disabled={deleting}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Yes, Delete"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
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
                      onClick={() => handleCopy(selectedPost.id, editContent)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      {copiedId === selectedPost.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Check className="w-3 h-3" />
                        Saved
                      </span>
                    )}
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving || editContent === selectedPost.content}
                      className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[#4374BA] hover:bg-[#4374BA]/80 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {newPostDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setNewPostDate(null)}
        >
          <div
            className="w-full max-w-md bg-[#0B0F1A] border border-white/[0.1] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-semibold text-white">New Post</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {newPostDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setNewPostDate(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Platform selector */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Platform</label>
                <div className="flex gap-2">
                  {(["twitter", "linkedin"] as const).map((p) => {
                    const badge = platformBadge[p];
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setNewPostPlatform(p);
                          setNewPostTimeSlot(0);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          newPostPlatform === p
                            ? "border-[#4374BA]/50 bg-[#4374BA]/10 text-white"
                            : "border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15]"
                        }`}
                      >
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        {p === "twitter" ? "Twitter / X" : "LinkedIn"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slot selector */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Time Slot</label>
                {newPostPlatform === "twitter" ? (
                  <div className="flex gap-2">
                    {TWITTER_TIME_SLOTS.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewPostTimeSlot(idx)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          newPostTimeSlot === idx
                            ? "border-[#4374BA]/50 bg-[#4374BA]/10 text-white"
                            : "border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg inline-block">
                    {LINKEDIN_TIME_SLOT.label}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Content</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={
                    newPostPlatform === "twitter"
                      ? "Write your tweet (280 chars max)..."
                      : "Write your LinkedIn post..."
                  }
                  rows={5}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4374BA]/50 resize-y"
                />
                {newPostPlatform === "twitter" && (
                  <p className={`text-xs mt-1 ${
                    newPostContent.length > 280 ? "text-red-400" : "text-gray-500"
                  }`}>
                    {newPostContent.length}/280
                  </p>
                )}
              </div>

              {/* Error */}
              {newPostError && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {newPostError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06]">
              <button
                onClick={handleCreatePost}
                disabled={newPostSaving || !newPostContent.trim()}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6C3393] to-[#4374BA] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {newPostSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Add to Calendar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

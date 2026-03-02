"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSocialAuth } from "../../components/SocialAuthProvider";

interface CalendarPost {
  id: string;
  content: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const platformStyle: Record<string, { bg: string; border: string; text: string }> = {
  twitter: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400" },
  linkedin: { bg: "bg-blue-600/10", border: "border-blue-600/30", text: "text-blue-400" },
  instagram: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400" },
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

export default function CalendarPage() {
  const { user, loading } = useSocialAuth();
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  useEffect(() => {
    if (!user) return;

    async function fetchPosts() {
      setLoadingPosts(true);
      try {
        const start = weekDates[0].toISOString();
        const end = new Date(
          weekDates[6].getTime() + 24 * 60 * 60 * 1000
        ).toISOString();
        const res = await fetch(
          `/api/posts?scheduled_after=${start}&scheduled_before=${end}&limit=100`
        );
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch {
        // silent
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchPosts();
  }, [user, weekDates]);

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
              className={`min-h-[160px] rounded-xl border p-2 ${
                isToday
                  ? "border-[#4374BA]/40 bg-[#4374BA]/5"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{DAYS[i]}</span>
                <span
                  className={`text-xs font-medium ${
                    isToday ? "text-[#4374BA]" : "text-gray-400"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Posts */}
              <div className="space-y-1">
                {loadingPosts ? (
                  <div className="h-8 bg-white/[0.04] rounded animate-pulse" />
                ) : (
                  dayPosts.map((post) => {
                    const style = platformStyle[post.platform] || platformStyle.twitter;
                    return (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className={`block p-1.5 rounded-md ${style.bg} border ${style.border} hover:opacity-80 transition-opacity`}
                      >
                        <p className={`text-[10px] font-medium ${style.text}`}>
                          {post.platform}
                        </p>
                        <p className="text-[10px] text-gray-400 line-clamp-2">
                          {post.content}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

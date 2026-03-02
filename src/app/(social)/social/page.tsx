"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSocialAuth } from "../components/SocialAuthProvider";

interface DashboardStats {
  draftCount: number;
  approvedCount: number;
  publishedCount: number;
  weekTotal: number;
}

interface RecentPost {
  id: string;
  content: string;
  platform: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function SocialDashboard() {
  const { user, loading } = useSocialAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const [statsRes, postsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/posts?limit=5"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (postsRes.ok) {
          const data = await postsRes.json();
          setRecentPosts(data.posts || []);
        }
      } catch {
        // Stats will show as loading
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Generated",
      sublabel: "Drafts",
      value: stats?.draftCount ?? "--",
      color: "text-gray-300",
    },
    {
      label: "Approved",
      sublabel: "Ready to post",
      value: stats?.approvedCount ?? "--",
      color: "text-green-400",
    },
    {
      label: "Published",
      sublabel: "Actually posted",
      value: stats?.publishedCount ?? "--",
      color: "text-emerald-400",
    },
    {
      label: "This Week",
      sublabel: "Total created",
      value: stats?.weekTotal ?? "--",
      color: "text-[#4374BA]",
    },
  ];

  const platformColors: Record<string, string> = {
    twitter: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20",
    linkedin: "bg-[#4374BA]/10 text-[#4374BA] border-[#4374BA]/20",
    instagram: "bg-[#6C3393]/10 text-[#6C3393] border-[#6C3393]/20",
  };

  const statusColors: Record<string, string> = {
    draft: "text-gray-400",
    pending_review: "text-yellow-400",
    approved: "text-green-400",
    scheduled: "text-[#4374BA]",
    published: "text-emerald-400",
    rejected: "text-red-400",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
            <p className="text-[10px] text-gray-600 mb-1">{card.sublabel}</p>
            <p className={`text-2xl font-bold ${card.color}`}>
              {loadingData ? (
                <span className="inline-block w-8 h-6 bg-white/[0.06] rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/generate"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#6C3393]/20 to-[#4374BA]/20 border border-[#6C3393]/30 rounded-xl hover:border-[#6C3393]/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-[#6C3393]/20 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6C3393"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Generate Posts</p>
            <p className="text-xs text-gray-400">AI-powered content</p>
          </div>
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-[#4374BA]/10 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4374BA"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Calendar</p>
            <p className="text-xs text-gray-400">
              {stats ? `${stats.approvedCount} ready to post` : "View schedule"}
            </p>
          </div>
        </Link>

        <Link
          href="/queue"
          className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EAB308"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Review Queue</p>
            <p className="text-xs text-gray-400">
              {stats?.draftCount ?? 0} drafts
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {loadingData ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse mb-2" />
                <div className="h-3 w-1/4 bg-white/[0.06] rounded animate-pulse" />
              </div>
            ))
          ) : recentPosts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No posts yet. Generate some content to get started.
            </div>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href="/calendar"
                className="block px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <p className="text-sm text-gray-300 line-clamp-1">
                  {post.content}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${platformColors[post.platform] || "text-gray-400"}`}
                  >
                    {post.platform}
                  </span>
                  <span
                    className={`text-xs ${statusColors[post.status] || "text-gray-400"}`}
                  >
                    {post.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(post.updated_at || post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

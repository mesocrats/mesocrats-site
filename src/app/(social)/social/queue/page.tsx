"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSocialAuth } from "../../components/SocialAuthProvider";

interface QueuePost {
  id: string;
  content: string;
  platform: string;
  category: string | null;
  status: string;
  created_at: string;
}

export default function QueuePage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<QueuePost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [acting, setActing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/posts?status=pending_review&limit=50");
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

  async function handleAction(postId: string, action: "approved" | "rejected") {
    if (!session) return;

    setActing((prev) => new Set(prev).add(postId));

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch {
      // silent
    } finally {
      setActing((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => p.platform === filter);

  const platformColors: Record<string, string> = {
    twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    linkedin: "bg-blue-600/10 text-blue-400 border-blue-600/20",
    instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Queue</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}{" "}
            pending review
          </p>
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-1">
          {["all", "twitter", "linkedin"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                filter === f
                  ? "bg-white/[0.08] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loadingPosts ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
            >
              <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse mb-3" />
              <div className="h-3 w-1/2 bg-white/[0.06] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No posts pending review.</p>
          <Link
            href="/generate"
            className="inline-block mt-4 px-4 py-2 text-sm text-[#6C3393] border border-[#6C3393]/30 rounded-lg hover:bg-[#6C3393]/10 transition-colors"
          >
            Generate Content
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${platformColors[post.platform] || "text-gray-400"}`}
                >
                  {post.platform}
                </span>
                {post.category && (
                  <span className="text-xs text-gray-600">{post.category}</span>
                )}
                <span className="text-xs text-gray-600 ml-auto">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-300 whitespace-pre-wrap mb-4">
                {post.content}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(post.id, "approved")}
                  disabled={acting.has(post.id)}
                  className="px-4 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(post.id, "rejected")}
                  disabled={acting.has(post.id)}
                  className="px-4 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <Link
                  href={`/posts/${post.id}`}
                  className="px-4 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors ml-auto"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

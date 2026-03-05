"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSocialAuth } from "../../../components/SocialAuthProvider";

interface PostData {
  id: string;
  content: string;
  platform: string;
  category: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  generation_metadata: {
    generation_type?: string;
    news_reference?: string | null;
    policy_topic?: string | null;
    rejection_reason?: string | null;
    [key: string]: unknown;
  } | null;
}

const categories = [
  "policy_morning",
  "current_events",
  "tech_story",
  "community_story",
  "ccx_update",
  "platform_feature",
  "founder_story",
];

const statuses = [
  "draft",
  "pending_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
];

export default function EditPostPage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loadingPost, setLoadingPost] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !postId) return;

    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data.post);
        setContent(data.post.content);
        setCategory(data.post.category || "");
        setStatus(data.post.status);
        setScheduledAt(
          data.post.scheduled_at
            ? data.post.scheduled_at.slice(0, 16)
            : ""
        );
      } catch {
        setError("Failed to load post");
      } finally {
        setLoadingPost(false);
      }
    }

    fetchPost();
  }, [user, postId]);

  async function handleSave() {
    if (!session) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          category: category || null,
          status,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update post");
      }

      const data = await res.json();
      setPost(data.post);
      setSuccessMsg("Post updated");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!session || !confirm("Delete this post? This cannot be undone.")) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        router.push("/");
      }
    } catch {
      setError("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadingPost) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-8 w-32 bg-white/[0.06] rounded animate-pulse mb-6" />
        <div className="h-40 bg-white/[0.06] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-gray-400">Post not found.</p>
      </div>
    );
  }

  const isTwitter = post.platform === "twitter";
  const charCount = content.length;
  const charLimit = isTwitter ? 280 : null;
  const overLimit = charLimit && charCount > charLimit;

  const statusColors: Record<string, string> = {
    draft: "text-gray-400",
    pending_review: "text-yellow-400",
    approved: "text-green-400",
    scheduled: "text-[#4374BA]",
    published: "text-emerald-400",
    rejected: "text-red-400",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Post</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {post.generation_metadata?.generation_type === "ai_generated" ? "AI Generated" : "Manual"}
          </span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-500">{post.platform}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                status === s
                  ? `${statusColors[s]} border-current bg-current/10`
                  : "text-gray-500 border-white/[0.06] hover:text-gray-300"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4374BA]/50 appearance-none"
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Content</label>
          {charLimit && (
            <span
              className={`text-xs ${overLimit ? "text-red-400" : "text-gray-500"}`}
            >
              {charCount}/{charLimit}
            </span>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={isTwitter ? 4 : 8}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4374BA]/50 resize-none"
        />
      </div>

      {/* Schedule */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-2">Schedule</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4374BA]/50"
        />
      </div>

      {/* Meta info */}
      {(post.generation_metadata?.policy_topic || post.generation_metadata?.news_reference) && (
        <div className="mb-6 p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
          {post.generation_metadata?.policy_topic && (
            <p className="text-xs text-gray-500">
              Policy topic: {post.generation_metadata.policy_topic}
            </p>
          )}
          {post.generation_metadata?.news_reference && (
            <p className="text-xs text-gray-500 mt-1">
              News reference: {post.generation_metadata.news_reference}
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          {successMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !content.trim() || !!overLimit}
          className="px-5 py-2 text-sm bg-gradient-to-r from-[#6C3393] to-[#4374BA] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 text-sm border border-white/[0.08] text-gray-400 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-5 py-2 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors ml-auto disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

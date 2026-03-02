"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocialAuth } from "../../../components/SocialAuthProvider";

type Platform = "twitter" | "linkedin" | "instagram";

const categories = [
  "policy_morning",
  "current_events",
  "tech_story",
  "community_story",
  "ccx_update",
  "platform_feature",
  "founder_story",
];

export default function NewPostPage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [category, setCategory] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  async function handleSubmit(status: "draft" | "pending_review") {
    if (!session || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          platform,
          category: category || null,
          status,
          scheduled_at: scheduledAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create post");
      }

      const data = await res.json();
      router.push(`/posts/${data.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const charCount = content.length;
  const isTwitter = platform === "twitter";
  const charLimit = isTwitter ? 280 : null;
  const overLimit = charLimit && charCount > charLimit;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">New Post</h1>

      {/* Platform */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Platform</label>
        <div className="flex gap-2">
          {(["twitter", "linkedin", "instagram"] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                platform === p
                  ? "border-[#4374BA]/50 bg-[#4374BA]/10 text-white"
                  : "border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">
          Category (optional)
        </label>
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
          placeholder={
            isTwitter
              ? "What's happening with the Mesocratic Party?"
              : "Write your post..."
          }
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4374BA]/50 resize-none"
        />
      </div>

      {/* Schedule */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-2">
          Schedule (optional)
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4374BA]/50"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleSubmit("draft")}
          disabled={submitting || !content.trim() || !!overLimit}
          className="px-5 py-2 text-sm border border-white/[0.08] text-gray-300 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit("pending_review")}
          disabled={submitting || !content.trim() || !!overLimit}
          className="px-5 py-2 text-sm bg-gradient-to-r from-[#6C3393] to-[#4374BA] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Submit for Review
        </button>
      </div>
    </div>
  );
}

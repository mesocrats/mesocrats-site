"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useSocialAuth } from "../../components/SocialAuthProvider";
import ModeSelector, {
  type ModeSelection,
  type PlatformChoice,
  getRemainingWeekdays,
  computeScheduledAt,
  formatTimeEST,
  getAPIPlatform,
  getAPIType,
  TIME_SLOTS,
} from "./ModeSelector";

interface GeneratedPost {
  content: string;
  category: string;
  suggested_day?: string;
  policy_topic?: string;
  news_reference?: string;
}

interface ConflictInfo {
  postIndex: number;
  existingPostId: string;
  existingContent: string;
  scheduledAt: string;
}

export default function GeneratePage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();

  const [mode, setMode] = useState<ModeSelection>({
    platform: "linkedin",
    scope: "full",
  });
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);
  const [targetDates, setTargetDates] = useState<string[]>([]);
  const [editedContent, setEditedContent] = useState<Record<number, string>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<Set<number>>(new Set());
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [rejected, setRejected] = useState<Set<number>>(new Set());
  const [approveErrors, setApproveErrors] = useState<Record<number, string>>(
    {}
  );

  // Conflict modal state
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [conflictResolving, setConflictResolving] = useState(false);

  // Approve-all pause state
  const [approveAllQueue, setApproveAllQueue] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  // --- Fetch recent posts for redundancy awareness ---
  async function fetchRecentPosts(platform: string): Promise<string[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const res = await fetch(
        `/api/posts?platform=${platform}&scheduled_after=${thirtyDaysAgo.toISOString()}&limit=100`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.posts || [])
        .filter(
          (p: { status: string }) =>
            p.status === "approved" || p.status === "published"
        )
        .map((p: { content: string }) => p.content);
    } catch {
      return [];
    }
  }

  // --- Check for conflicts ---
  async function checkConflict(
    platform: string,
    scheduledAt: string
  ): Promise<{ id: string; content: string } | null> {
    try {
      // Check for existing posts on same platform within the same hour
      const target = new Date(scheduledAt);
      const windowStart = new Date(target);
      windowStart.setMinutes(0, 0, 0);
      const windowEnd = new Date(windowStart);
      windowEnd.setHours(windowEnd.getHours() + 1);

      const res = await fetch(
        `/api/posts?platform=${platform}&scheduled_after=${windowStart.toISOString()}&scheduled_before=${windowEnd.toISOString()}&limit=1`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const existing = (data.posts || []).filter(
        (p: { status: string }) =>
          p.status === "approved" ||
          p.status === "scheduled" ||
          p.status === "published"
      );
      if (existing.length > 0) {
        return { id: existing[0].id, content: existing[0].content };
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- Generate ---
  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResults([]);
    setEditedContent({});
    setApproved(new Set());
    setRejected(new Set());
    setApproveErrors({});
    setTargetDates([]);

    const apiPlatform = getAPIPlatform(mode.platform);
    const apiType = getAPIType(mode.platform);

    // Compute target dates and count
    let dates: string[];
    let count: number;

    if (mode.scope === "full") {
      if (mode.platform === "twitter_today") {
        // Full day: 3 tweets for today
        const today = new Date().toISOString().split("T")[0];
        dates = [today, today, today];
        count = 3;
      } else {
        dates = getRemainingWeekdays();
        count = dates.length;
      }
    } else {
      // Single post
      count = 1;
      if (mode.platform === "twitter_today") {
        dates = [new Date().toISOString().split("T")[0]];
      } else {
        dates = [mode.singleDate || new Date().toISOString().split("T")[0]];
      }
    }

    if (count === 0) {
      setError("No remaining weekdays to generate for this week.");
      setGenerating(false);
      return;
    }

    setTargetDates(dates);

    // Fetch recent posts for redundancy
    const recentPosts = await fetchRecentPosts(apiPlatform);

    // Calculate week start (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStart = monday.toISOString().split("T")[0];

    // Build day names for the prompt
    const dayNames = dates.map((d) => {
      const dt = new Date(d + "T12:00:00");
      return dt.toLocaleDateString("en-US", { weekday: "long" });
    });

    const additionalCtx = [
      additionalContext || "",
      mode.scope === "full" && mode.platform !== "twitter_today"
        ? `Generate posts ONLY for these specific days: ${dayNames.join(", ")}. That is ${count} posts total.`
        : "",
      mode.scope === "single" && mode.platform !== "twitter_today"
        ? `Generate exactly 1 post for ${dayNames[0]}.`
        : "",
      mode.scope === "single" && mode.platform === "twitter_today"
        ? `Generate exactly 1 tweet.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          platform: apiPlatform,
          type: apiType,
          count,
          weekStart,
          additionalContext: additionalCtx,
          recent_posts:
            recentPosts.length > 0 ? recentPosts.slice(0, 50) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      setResults(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  // --- Approve single post (with conflict check) ---
  const handleApprove = useCallback(
    async (index: number) => {
      const post = results[index];
      if (!post || !session) return;

      setApproving((prev) => new Set(prev).add(index));
      setApproveErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });

      const platform = getAPIPlatform(mode.platform);
      const content = editedContent[index] ?? post.content;

      // Determine the scheduled date
      let dateStr: string;
      if (mode.scope === "single") {
        if (mode.platform === "twitter_today") {
          dateStr = new Date().toISOString().split("T")[0];
        } else {
          dateStr =
            mode.singleDate || new Date().toISOString().split("T")[0];
        }
      } else {
        dateStr = targetDates[index] || new Date().toISOString().split("T")[0];
      }

      const scheduledAt = computeScheduledAt(
        mode.platform,
        mode.scope,
        dateStr,
        index,
        mode.singleTimeSlot
      );

      // Conflict check
      const existing = await checkConflict(platform, scheduledAt);
      if (existing) {
        setConflict({
          postIndex: index,
          existingPostId: existing.id,
          existingContent: existing.content,
          scheduledAt,
        });
        setApproving((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
        return;
      }

      await savePost(index, content, platform, scheduledAt);
    },
    [results, session, mode, editedContent, targetDates]
  );

  // --- Save post to DB ---
  async function savePost(
    index: number,
    content: string,
    platform: string,
    scheduledAt: string,
    replaceId?: string
  ) {
    setApproving((prev) => new Set(prev).add(index));
    const post = results[index];

    try {
      // Delete existing post if replacing
      if (replaceId && session) {
        await fetch(`/api/posts/${replaceId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content,
          platform,
          category: post.category,
          status: "approved",
          scheduled_at: scheduledAt,
          policy_topic: post.policy_topic || null,
          news_reference: post.news_reference || null,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setApproveErrors((prev) => ({
          ...prev,
          [index]: data?.error || `Failed (${res.status})`,
        }));
        return;
      }

      setApproved((prev) => new Set(prev).add(index));
    } catch (err) {
      setApproveErrors((prev) => ({
        ...prev,
        [index]: err instanceof Error ? err.message : "Network error",
      }));
    } finally {
      setApproving((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  // --- Conflict resolution ---
  async function handleConflictResolve(action: "replace" | "keep_both") {
    if (!conflict || !session) return;
    setConflictResolving(true);

    const { postIndex, existingPostId, scheduledAt } = conflict;
    const post = results[postIndex];
    const content = editedContent[postIndex] ?? post.content;
    const platform = getAPIPlatform(mode.platform);

    await savePost(
      postIndex,
      content,
      platform,
      scheduledAt,
      action === "replace" ? existingPostId : undefined
    );

    setConflict(null);
    setConflictResolving(false);

    // Resume approve-all queue if active
    if (approveAllQueue.length > 0) {
      processApproveAllQueue();
    }
  }

  // --- Approve All ---
  async function handleApproveAll() {
    const pending = results
      .map((_, i) => i)
      .filter((i) => !approved.has(i) && !rejected.has(i));
    setApproveAllQueue(pending);
    processApproveAllQueueFrom(pending);
  }

  async function processApproveAllQueue() {
    processApproveAllQueueFrom(approveAllQueue);
  }

  async function processApproveAllQueueFrom(queue: number[]) {
    for (const idx of queue) {
      if (approved.has(idx) || rejected.has(idx)) continue;

      // handleApprove may set a conflict modal — if so, we pause
      await handleApprove(idx);

      // If a conflict was triggered, the queue will resume after resolution
      // We need to save remaining queue and break
      // Check if conflict state was set (it will be set synchronously in handleApprove)
      // Since handleApprove is async, we check after await
      // The conflict state check happens after the await resolves
    }
    setApproveAllQueue([]);
  }

  function handleReject(index: number) {
    setRejected((prev) => new Set(prev).add(index));
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const platformColors: Record<string, string> = {
    twitter: "border-sky-500/30 bg-white/[0.02]",
    linkedin: "border-blue-600/30 bg-white/[0.02]",
  };

  const visibleResults = results.filter((_, i) => !rejected.has(i));
  const allHandled = results.every(
    (_, i) => approved.has(i) || rejected.has(i)
  );
  const pendingCount = results.filter(
    (_, i) => !approved.has(i) && !rejected.has(i)
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Generate Content</h1>

      {/* Mode selection */}
      <ModeSelector value={mode} onChange={setMode} disabled={generating} />

      {/* Additional context */}
      <div className="mt-6 mb-6">
        <label className="block text-xs text-gray-400 mb-2">
          Additional Context (optional)
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="e.g., Focus on housing policy this week, mention the new API release..."
          rows={3}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4374BA]/50"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="px-6 py-2.5 bg-gradient-to-r from-[#6C3393] to-[#4374BA] text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {generating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          "Generate"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Generated Posts ({visibleResults.length})
            </h2>
            {!allHandled && pendingCount > 1 && (
              <button
                onClick={handleApproveAll}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve All ({pendingCount})
              </button>
            )}
          </div>

          <div className="space-y-4">
            {results.map((post, i) => {
              if (rejected.has(i)) return null;

              const platform = getAPIPlatform(mode.platform);
              const isApproved = approved.has(i);
              const isApproving = approving.has(i);
              const approveError = approveErrors[i];

              // Compute schedule info for display
              let dateStr = targetDates[i] || "";
              if (mode.scope === "single") {
                if (mode.platform === "twitter_today") {
                  dateStr = new Date().toISOString().split("T")[0];
                } else {
                  dateStr = mode.singleDate || "";
                }
              }
              const scheduledAt = dateStr
                ? computeScheduledAt(
                    mode.platform,
                    mode.scope,
                    dateStr,
                    i,
                    mode.singleTimeSlot
                  )
                : "";
              const scheduledTime = scheduledAt
                ? formatTimeEST(scheduledAt)
                : "";
              const scheduledDay = dateStr
                ? new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                  })
                : post.suggested_day || "";

              return (
                <div
                  key={i}
                  className={`border rounded-xl p-4 transition-all ${
                    isApproved
                      ? "border-green-500/30 bg-green-500/5"
                      : platformColors[platform] ||
                        "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {scheduledDay && (
                        <span className="text-xs text-gray-500">
                          {scheduledDay}
                        </span>
                      )}
                      {scheduledTime && (
                        <span className="text-xs text-gray-500">
                          {scheduledTime}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {post.category}
                      </span>
                      {isApproved && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          Added to calendar
                        </span>
                      )}
                    </div>

                    {!isApproved && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(i)}
                          disabled={isApproving}
                          title="Approve"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                        >
                          {isApproving ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(i)}
                          title="Reject"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {approveError && (
                    <div className="mb-2 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      Approve failed: {approveError}
                    </div>
                  )}

                  {isApproved ? (
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {editedContent[i] ?? post.content}
                    </p>
                  ) : (
                    <textarea
                      value={editedContent[i] ?? post.content}
                      onChange={(e) =>
                        setEditedContent((prev) => ({
                          ...prev,
                          [i]: e.target.value,
                        }))
                      }
                      rows={Math.max(
                        3,
                        (editedContent[i] ?? post.content).split("\n").length + 1
                      )}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#4374BA]/50 resize-y"
                    />
                  )}

                  {post.policy_topic && (
                    <p className="text-xs text-gray-500 mt-2">
                      Policy: {post.policy_topic}
                    </p>
                  )}
                  {post.news_reference && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ref: {post.news_reference}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal */}
      {conflict && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setConflict(null);
            setApproveAllQueue([]);
          }}
        >
          <div
            className="w-full max-w-md bg-[#0B0F1A] border border-white/[0.1] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">
                Scheduling Conflict
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                A post already exists for this slot (
                {formatTimeEST(conflict.scheduledAt)}).
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">Existing post:</p>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-gray-400 line-clamp-3">
                  {conflict.existingContent}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-white/[0.06]">
              <button
                onClick={() => handleConflictResolve("replace")}
                disabled={conflictResolving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
              >
                Replace
              </button>
              <button
                onClick={() => handleConflictResolve("keep_both")}
                disabled={conflictResolving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#4374BA] hover:bg-[#4374BA]/80 rounded-lg transition-colors disabled:opacity-50"
              >
                Keep Both
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

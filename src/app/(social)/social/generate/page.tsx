"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useSocialAuth } from "../../components/SocialAuthProvider";

interface GeneratedPost {
  content: string;
  category: string;
  suggested_day?: string;
  policy_topic?: string;
  news_reference?: string;
}

type GenerationMode = "linkedin_week" | "twitter_policy_week" | "twitter_today";

const modes: { value: GenerationMode; label: string; description: string }[] = [
  {
    value: "linkedin_week",
    label: "LinkedIn Week",
    description: "5 LinkedIn posts for the week -- tech, org, and platform stories",
  },
  {
    value: "twitter_policy_week",
    label: "Twitter Policy Week",
    description: "5 morning policy tweets, one per weekday",
  },
  {
    value: "twitter_today",
    label: "Today's Tweets",
    description: "3 tweets responding to today's news with the Mesocratic perspective",
  },
];

const DAY_MAP: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

// EST posting times (UTC offsets: EST = UTC-5)
const CURRENT_EVENTS_HOURS_UTC = [15, 18, 22]; // 10 AM, 1 PM, 5 PM EST
const POLICY_MORNING_HOUR_UTC = 12; // 7 AM EST
const LINKEDIN_HOUR_UTC = 14; // 9 AM EST

function getScheduledDate(
  mode: GenerationMode,
  index: number,
  suggestedDay?: string
): string {
  // Determine the target date
  let targetDate: Date;

  if (mode === "twitter_today") {
    // Daily tweets: schedule for today
    targetDate = new Date();
  } else if (suggestedDay) {
    const targetDay = DAY_MAP[suggestedDay.toLowerCase()];
    if (targetDay !== undefined) {
      const today = new Date();
      const currentDay = today.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
    } else {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);
      while (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }
  } else {
    // Default to tomorrow, skip weekends
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    while (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  // Set the time in UTC based on mode
  let hourUTC: number;
  if (mode === "twitter_today") {
    hourUTC = CURRENT_EVENTS_HOURS_UTC[index] ?? CURRENT_EVENTS_HOURS_UTC[0];
  } else if (mode === "twitter_policy_week") {
    hourUTC = POLICY_MORNING_HOUR_UTC;
  } else {
    hourUTC = LINKEDIN_HOUR_UTC;
  }

  // Build the date in UTC
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  const scheduled = new Date(Date.UTC(year, month, day, hourUTC, 0, 0, 0));

  return scheduled.toISOString();
}

function formatTimeEST(isoString: string): string {
  const d = new Date(isoString);
  // Convert UTC to EST (UTC-5)
  const estHour = (d.getUTCHours() - 5 + 24) % 24;
  const ampm = estHour >= 12 ? "PM" : "AM";
  const displayHour = estHour === 0 ? 12 : estHour > 12 ? estHour - 12 : estHour;
  return `${displayHour}:00 ${ampm} EST`;
}

export default function GeneratePage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();
  const [mode, setMode] = useState<GenerationMode>("linkedin_week");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);
  const [editedContent, setEditedContent] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<Set<number>>(new Set());
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [rejected, setRejected] = useState<Set<number>>(new Set());
  const [approveErrors, setApproveErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResults([]);
    setEditedContent({});
    setApproved(new Set());
    setRejected(new Set());
    setApproveErrors({});

    const modeConfig: Record<GenerationMode, { platform: string; type?: string; count: number }> = {
      linkedin_week: { platform: "linkedin", count: 5 },
      twitter_policy_week: { platform: "twitter", type: "policy_morning", count: 5 },
      twitter_today: { platform: "twitter", type: "current_events", count: 3 },
    };

    const config = modeConfig[mode];

    // Calculate week start (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStart = monday.toISOString().split("T")[0];

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...config,
          weekStart,
          additionalContext: additionalContext || undefined,
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

  const handleApprove = useCallback(
    async (index: number) => {
      const post = results[index];
      if (!post || !session) {
        console.error("[approve] No post or session", { post: !!post, session: !!session });
        return;
      }

      setApproving((prev) => new Set(prev).add(index));
      setApproveErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });

      const platform = mode === "linkedin_week" ? "linkedin" : "twitter";
      const content = editedContent[index] ?? post.content;
      const scheduledAt = getScheduledDate(mode, index, post.suggested_day);

      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
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

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg = data?.error || `Failed (${res.status})`;
          console.error("[approve] API error:", msg);
          setApproveErrors((prev) => ({ ...prev, [index]: msg }));
          return;
        }

        console.log("[approve] Post approved successfully, index:", index);
        setApproved((prev) => new Set(prev).add(index));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        console.error("[approve] Fetch error:", msg);
        setApproveErrors((prev) => ({ ...prev, [index]: msg }));
      } finally {
        setApproving((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    },
    [results, session, mode, editedContent]
  );

  async function handleApproveAll() {
    for (let i = 0; i < results.length; i++) {
      if (!approved.has(i) && !rejected.has(i)) {
        await handleApprove(i);
      }
    }
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
  const allHandled = results.every((_, i) => approved.has(i) || rejected.has(i));
  const pendingCount = results.filter((_, i) => !approved.has(i) && !rejected.has(i)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Generate Content</h1>

      {/* Mode selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              mode === m.value
                ? "border-[#6C3393]/50 bg-[#6C3393]/10"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
            }`}
          >
            <p className="text-sm font-medium text-white">{m.label}</p>
            <p className="text-xs text-gray-400 mt-1">{m.description}</p>
          </button>
        ))}
      </div>

      {/* Additional context */}
      <div className="mb-6">
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
            {!allHandled && pendingCount > 0 && (
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

              const platform = mode === "linkedin_week" ? "linkedin" : "twitter";
              const isApproved = approved.has(i);
              const isApproving = approving.has(i);
              const approveError = approveErrors[i];
              const scheduledTime = formatTimeEST(
                getScheduledDate(mode, i, post.suggested_day)
              );

              return (
                <div
                  key={i}
                  className={`border rounded-xl p-4 transition-all ${
                    isApproved
                      ? "border-green-500/30 bg-green-500/5"
                      : platformColors[platform] || "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.suggested_day && (
                        <span className="text-xs text-gray-500">
                          {post.suggested_day}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {scheduledTime}
                      </span>
                      <span className="text-xs text-gray-600">
                        {post.category}
                      </span>
                      {isApproved && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          Approved
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
                        setEditedContent((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      rows={Math.max(3, (editedContent[i] ?? post.content).split("\n").length + 1)}
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
    </div>
  );
}

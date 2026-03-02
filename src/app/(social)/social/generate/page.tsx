"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function GeneratePage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();
  const [mode, setMode] = useState<GenerationMode>("linkedin_week");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResults([]);
    setSaved(new Set());

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

  async function handleSave(index: number) {
    const post = results[index];
    if (!post || !session) return;

    setSaving((prev) => new Set(prev).add(index));

    const platform = mode === "linkedin_week" ? "linkedin" : "twitter";

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: post.content,
          platform,
          category: post.category,
          status: "draft",
          policy_topic: post.policy_topic || null,
          news_reference: post.news_reference || null,
        }),
      });

      if (res.ok) {
        setSaved((prev) => new Set(prev).add(index));
      }
    } catch {
      // silent
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  async function handleSaveAll() {
    for (let i = 0; i < results.length; i++) {
      if (!saved.has(i)) {
        await handleSave(i);
      }
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const platformColors: Record<string, string> = {
    twitter: "border-sky-500/30",
    linkedin: "border-blue-600/30",
  };

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
              Generated Posts ({results.length})
            </h2>
            <button
              onClick={handleSaveAll}
              className="px-4 py-1.5 text-sm text-[#4374BA] border border-[#4374BA]/30 rounded-lg hover:bg-[#4374BA]/10 transition-colors"
            >
              Save All as Drafts
            </button>
          </div>

          <div className="space-y-4">
            {results.map((post, i) => {
              const platform = mode === "linkedin_week" ? "linkedin" : "twitter";
              return (
                <div
                  key={i}
                  className={`border rounded-xl p-4 ${platformColors[platform] || "border-white/[0.06]"} bg-white/[0.02]`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      {post.suggested_day && (
                        <span className="text-xs text-gray-500">
                          {post.suggested_day}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {post.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSave(i)}
                      disabled={saving.has(i) || saved.has(i)}
                      className={`shrink-0 px-3 py-1 text-xs rounded-md transition-colors ${
                        saved.has(i)
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-white/[0.04] text-gray-400 hover:text-white border border-white/[0.08]"
                      }`}
                    >
                      {saved.has(i)
                        ? "Saved"
                        : saving.has(i)
                          ? "Saving..."
                          : "Save Draft"}
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {post.content}
                  </p>
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

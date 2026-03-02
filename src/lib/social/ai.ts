import { MESOCRATIC_REFERENCE_GUIDE } from "./reference";
import type { Platform, PostCategory } from "./supabase";

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 4096;

export interface GeneratedPost {
  content: string;
  category: PostCategory | string;
  suggested_day?: string;
  policy_topic?: string;
  news_reference?: string;
}

interface GenerateOptions {
  platform: Platform;
  type?: "policy_morning" | "current_events";
  count: number;
  weekStart?: string;
  additionalContext?: string;
}

function buildSystemPrompt(): string {
  return `${MESOCRATIC_REFERENCE_GUIDE}

---

You are the social media content generator for the Mesocratic National Committee. Every post you generate must strictly follow the reference guide above. Maintain the brand voice: direct, confident, warm, grounded. Follow the Issue Framework for political content. Respect both parties. Never attack.

Return your response as a JSON array of post objects. Output ONLY valid JSON -- no markdown fencing, no commentary.`;
}

function buildUserPrompt(options: GenerateOptions): string {
  const { platform, type, count, weekStart, additionalContext } = options;

  if (platform === "linkedin") {
    return `Generate ${count} LinkedIn posts about building the Mesocratic Party's technology and organization. Focus on business, technology, and organizational achievements. Do NOT include political positioning. Each post should be 150-300 words, professional but conversational. Include a brief hook in the first line.${weekStart ? ` Posts are for the week starting ${weekStart}.` : ""}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}

Return as a JSON array with objects: { "content": string, "category": "tech_story" | "platform_feature" | "ccx_update" | "founder_story", "suggested_day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" }`;
  }

  if (platform === "twitter" && type === "policy_morning") {
    return `Generate ${count} morning policy tweets, one for each day of the week starting ${weekStart || "Monday"}. Each tweet connects a Mesocratic policy position to something in recent US news (past 6 months). Under 280 characters. Direct, warm, grounded. Use the Issue Framework in abbreviated form. No hashtag spam (0-1 hashtag).

IMPORTANT: Never reference internal policy framework names, marketing slogans, or taglines in tweets. For example, do not say "Our All of the Above framework" or "Our Strong and Accountable position" or "The Two-Tier Plan." These are internal labels that mean nothing to a general audience. Instead, describe the SUBSTANCE of the policy in plain language. Say what we believe, not what we named it.
BAD: "Our All of the Above energy framework includes nuclear and renewables."
GOOD: "We support every energy source that works — nuclear, solar, wind, natural gas. Energy dominance means depending on no one."
BAD: "The Mesocratic Strong and Accountable defense position demands oversight."
GOOD: "A strong military needs real accountability. Tie funding to audits. Define objectives before deploying troops."${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}

Return as a JSON array with objects: { "content": string, "category": "policy_morning", "suggested_day": "Monday" | "Tuesday" | etc., "policy_topic": string }`;
  }

  if (platform === "twitter" && type === "current_events") {
    return `Generate ${count} tweets responding to what's happening in the news RIGHT NOW. Search for today's top US news stories and provide the Mesocratic perspective. Under 280 characters each. Friendly, substantive, never preachy.

CRITICAL TONE RULES FOR CURRENT EVENTS TWEETS:
- We are NOT commentators criticizing whoever is in office. We are leaders presenting our own framework.
- NEVER frame tweets as complaints, demands, or finger-pointing at current leadership.
- NEVER use phrases like "Americans deserve," "leadership should," "we need answers," or "they need to explain." These are opposition-party clichés.
- Instead, acknowledge the news event briefly, then pivot to how the Mesocratic framework addresses the underlying issue.
- The structure is: [What happened] + [What the Mesocratic position offers] + [Why it matters for real people]
- Tone: Confident, solutions-oriented, forward-looking. We are not reacting to their failures. We are presenting our alternative.
- We never attack individuals by name. We never attack parties by name in tweets. We state our position and let the contrast speak for itself.
- Think of it as: "Here's what's happening. Here's how we'd approach it. Here's what it means for you."
- BAD example: "Americans shouldn't have to guess about war objectives. We need transparency from leadership."
- GOOD example: "A strong military needs real accountability. Tie funding to audits. Define objectives before deploying troops. That's what oversight looks like."

IMPORTANT: Never reference internal policy framework names, marketing slogans, or taglines in tweets. For example, do not say "Our All of the Above framework" or "Our Strong and Accountable position" or "The Two-Tier Plan." These are internal labels that mean nothing to a general audience. Instead, describe the SUBSTANCE of the policy in plain language. Say what we believe, not what we named it.
BAD: "Our All of the Above energy framework includes nuclear and renewables."
GOOD: "We support every energy source that works — nuclear, solar, wind, natural gas. Energy dominance means depending on no one."
BAD: "The Mesocratic Strong and Accountable defense position demands oversight."
GOOD: "A strong military needs real accountability. Tie funding to audits. Define objectives before deploying troops."${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}

Return as a JSON array with objects: { "content": string, "category": "current_events", "news_reference": string }`;
  }

  // Default twitter
  return `Generate ${count} tweets for the Mesocratic Party. Under 280 characters each. Follow the brand voice.${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}

Return as a JSON array with objects: { "content": string, "category": "current_events" }`;
}

export async function generatePosts(
  options: GenerateOptions
): Promise<{ posts: GeneratedPost[]; usage: { input_tokens: number; output_tokens: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(options);

  const useWebSearch =
    options.platform === "twitter" && options.type === "current_events";

  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  };

  if (useWebSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  // Extract text content from the response
  let textContent = "";
  for (const block of data.content) {
    if (block.type === "text") {
      textContent += block.text;
    }
  }

  // Parse JSON array from the response
  const jsonMatch = textContent.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse generated posts from API response");
  }

  const posts: GeneratedPost[] = JSON.parse(jsonMatch[0]);

  return {
    posts,
    usage: {
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    },
  };
}

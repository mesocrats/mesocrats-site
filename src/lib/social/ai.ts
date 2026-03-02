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
    return `Generate ${count} morning policy tweets, one for each day of the week starting ${weekStart || "Monday"}. Each tweet connects a Mesocratic policy position to something in recent US news (past 6 months). Under 280 characters. Direct, warm, grounded. Use the Issue Framework in abbreviated form. No hashtag spam (0-1 hashtag).${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}

Return as a JSON array with objects: { "content": string, "category": "policy_morning", "suggested_day": "Monday" | "Tuesday" | etc., "policy_topic": string }`;
  }

  if (platform === "twitter" && type === "current_events") {
    return `Generate ${count} tweets responding to what's happening in the news RIGHT NOW. Search for today's top US news stories and provide the Mesocratic perspective. Under 280 characters each. Friendly, substantive, never preachy.${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}

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

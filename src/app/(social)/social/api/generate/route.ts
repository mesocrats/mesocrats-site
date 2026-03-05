import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/social/auth";
import { generatePosts } from "@/lib/social/ai";
import { createServerSupabase } from "@/lib/social/supabase";
import type { Platform } from "@/lib/social/supabase";

export async function POST(request: NextRequest) {
  const user = await verifyApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    platform: Platform;
    type?: "policy_morning" | "current_events";
    count: number;
    weekStart?: string;
    additionalContext?: string;
    recent_posts?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.platform || !body.count) {
    return NextResponse.json(
      { error: "platform and count are required" },
      { status: 400 }
    );
  }

  try {
    const result = await generatePosts({
      platform: body.platform,
      type: body.type,
      count: body.count,
      weekStart: body.weekStart,
      additionalContext: body.additionalContext,
      recentPosts: body.recent_posts,
    });

    // Log the generation
    const supabase = createServerSupabase();
    await supabase.from("generation_logs").insert({
      platform: body.platform,
      generation_type: body.type || "default",
      count: result.posts.length,
      model: "claude-sonnet-4-5-20250929",
      prompt_tokens: result.usage.input_tokens,
      completion_tokens: result.usage.output_tokens,
      total_tokens: result.usage.input_tokens + result.usage.output_tokens,
      created_by: user.id,
    });

    return NextResponse.json({
      posts: result.posts,
      usage: result.usage,
    });
  } catch (err) {
    console.error("[social/api/generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}

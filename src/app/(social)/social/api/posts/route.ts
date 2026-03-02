import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/social/auth";
import { createServerSupabase } from "@/lib/social/supabase";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = request.nextUrl;

  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const scheduledAfter = searchParams.get("scheduled_after");
  const scheduledBefore = searchParams.get("scheduled_before");

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }
  if (platform) {
    query = query.eq("platform", platform);
  }
  if (scheduledAfter) {
    query = query.gte("scheduled_at", scheduledAfter);
  }
  if (scheduledBefore) {
    query = query.lte("scheduled_at", scheduledBefore);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[social/api/posts] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    content: string;
    platform: string;
    category?: string | null;
    status?: string;
    scheduled_at?: string | null;
    policy_topic?: string | null;
    news_reference?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.content || !body.platform) {
    return NextResponse.json(
      { error: "content and platform are required" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content: body.content,
      platform: body.platform,
      category: body.category || null,
      status: body.status || "draft",
      scheduled_at: body.scheduled_at || null,
      policy_topic: body.policy_topic || null,
      news_reference: body.news_reference || null,
      generation_type: "manual",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[social/api/posts] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }

  return NextResponse.json({ post: data }, { status: 201 });
}

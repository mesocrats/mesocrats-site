import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/social/auth";
import { createServerSupabase } from "@/lib/social/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await verifyApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    content?: string;
    post_category?: string | null;
    status?: string;
    scheduled_at?: string | null;
    rejection_reason?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.content !== undefined) updates.content = body.content;
  if (body.post_category !== undefined) updates.post_category = body.post_category;
  if (body.status !== undefined) updates.status = body.status;
  if (body.scheduled_at !== undefined) updates.scheduled_at = body.scheduled_at;
  if (body.rejection_reason !== undefined) updates.rejection_reason = body.rejection_reason;

  // Status transition logic
  if (body.status === "published") {
    updates.published_at = new Date().toISOString();
  } else if (body.status === "approved") {
    // Clear published_at when toggling back from published
    updates.published_at = null;

    // Auto-assign scheduled_at if not already set and not provided in this request
    if (body.scheduled_at === undefined) {
      const { data: existing } = await supabase
        .from("posts")
        .select("scheduled_at")
        .eq("id", id)
        .single();

      if (existing && !existing.scheduled_at) {
        // Assign to tomorrow or next weekday
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Skip weekends
        while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
          tomorrow.setDate(tomorrow.getDate() + 1);
        }
        tomorrow.setHours(9, 0, 0, 0);
        updates.scheduled_at = tomorrow.toISOString();
      }
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("[social/api/posts/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await verifyApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("[social/api/posts/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

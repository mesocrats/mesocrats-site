import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/social/supabase";

export async function GET() {
  const supabase = createServerSupabase();

  // Run all queries in parallel
  const [totalRes, pendingRes, publishedRes, scheduledRes] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte(
        "published_at",
        new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      ),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled"),
  ]);

  return NextResponse.json({
    totalPosts: totalRes.count ?? 0,
    pendingReview: pendingRes.count ?? 0,
    publishedThisWeek: publishedRes.count ?? 0,
    scheduledUpcoming: scheduledRes.count ?? 0,
  });
}

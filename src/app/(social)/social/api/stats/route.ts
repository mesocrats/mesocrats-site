import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/social/supabase";

export async function GET() {
  const supabase = createServerSupabase();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Run all queries in parallel
  const [draftRes, approvedRes, publishedRes, weekTotalRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .in("status", ["approved", "scheduled"]),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
  ]);

  return NextResponse.json({
    draftCount: draftRes.count ?? 0,
    approvedCount: approvedRes.count ?? 0,
    publishedCount: publishedRes.count ?? 0,
    weekTotal: weekTotalRes.count ?? 0,
  });
}

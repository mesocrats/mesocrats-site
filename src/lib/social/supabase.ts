// Social Portal Supabase Client
//
// Environment variables required:
//   SOCIAL_SUPABASE_URL              - Supabase project URL (server-side)
//   SOCIAL_SUPABASE_SERVICE_ROLE_KEY - Service role key (server-side only)
//   SOCIAL_SUPABASE_ANON_KEY         - Anon/public key (server-side)
//   NEXT_PUBLIC_SOCIAL_SUPABASE_URL  - Supabase project URL (client-side)
//   NEXT_PUBLIC_SOCIAL_SUPABASE_ANON_KEY - Anon/public key (client-side)
//   ANTHROPIC_API_KEY                - Anthropic API key (server-side only)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Database types                                                     */
/* ------------------------------------------------------------------ */

export type Platform = "linkedin" | "twitter" | "instagram";

export type PostStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export type GenerationType = "ai_generated" | "manual";

export type PostCategory =
  | "policy_morning"
  | "current_events"
  | "tech_story"
  | "community_story"
  | "ccx_update"
  | "platform_feature"
  | "founder_story";

export interface Post {
  id: string;
  content: string;
  platform: Platform;
  category: PostCategory | null;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  image_url: string | null;
  generation_type: GenerationType;
  news_reference: string | null;
  policy_topic: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PlatformConnection {
  id: string;
  platform: Platform;
  connected: boolean;
  account_name: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationLog {
  id: string;
  platform: Platform;
  generation_type: string;
  count: number;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  created_at: string;
  created_by: string;
}

export interface WeeklyPlan {
  id: string;
  week_start: string;
  status: string;
  created_at: string;
  created_by: string;
}

export interface WeeklyPlanPost {
  id: string;
  weekly_plan_id: string;
  post_id: string;
  day_of_week: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      posts: { Row: Post };
      platform_connections: { Row: PlatformConnection };
      generation_logs: { Row: GenerationLog };
      weekly_plans: { Row: WeeklyPlan };
      weekly_plan_posts: { Row: WeeklyPlanPost };
    };
  };
}

/* ------------------------------------------------------------------ */
/*  Server-side client (service role -- full access)                   */
/* ------------------------------------------------------------------ */

export function createServerSupabase(): SupabaseClient {
  const url = process.env.SOCIAL_SUPABASE_URL;
  const key = process.env.SOCIAL_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SOCIAL_SUPABASE_URL or SOCIAL_SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/* ------------------------------------------------------------------ */
/*  Client-side client (anon key -- RLS enforced)                     */
/* ------------------------------------------------------------------ */

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SOCIAL_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SOCIAL_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}

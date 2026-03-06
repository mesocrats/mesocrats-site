"use server";

import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { createPartyStackClient } from "../../../lib/partystack-db";

async function getCommitteeId(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Look up the committee_id from the user's active API key
  const { data } = await supabase
    .from("developer_api_keys")
    .select("committee_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .not("committee_id", "is", null)
    .limit(1)
    .single();

  return data?.committee_id ?? null;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  active: boolean;
  created_at: string;
}

export async function listWebhookEndpoints(): Promise<{
  error?: string;
  endpoints: WebhookEndpoint[];
  committeeId?: string | null;
}> {
  const committeeId = await getCommitteeId();
  if (!committeeId) return { endpoints: [], committeeId: null };

  const ps = createPartyStackClient();
  const { data, error } = await ps
    .from("webhook_endpoints")
    .select("id, url, description, active, created_at")
    .eq("committee_id", committeeId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, endpoints: [] };
  return { endpoints: data ?? [], committeeId };
}

export async function createWebhookEndpoint(url: string, description: string) {
  const committeeId = await getCommitteeId();
  if (!committeeId) return { error: "No committee bound to your API key" };

  const ps = createPartyStackClient();
  const { error } = await ps.from("webhook_endpoints").insert({
    committee_id: committeeId,
    url,
    description: description || null,
    active: true,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteWebhookEndpoint(id: string) {
  const committeeId = await getCommitteeId();
  if (!committeeId) return { error: "No committee bound" };

  const ps = createPartyStackClient();
  const { error } = await ps
    .from("webhook_endpoints")
    .delete()
    .eq("id", id)
    .eq("committee_id", committeeId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleWebhookEndpoint(id: string, active: boolean) {
  const committeeId = await getCommitteeId();
  if (!committeeId) return { error: "No committee bound" };

  const ps = createPartyStackClient();
  const { error } = await ps
    .from("webhook_endpoints")
    .update({ active })
    .eq("id", id)
    .eq("committee_id", committeeId);

  if (error) return { error: error.message };
  return { success: true };
}

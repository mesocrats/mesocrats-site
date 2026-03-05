// src/lib/mce/webhooks.ts
// Mesocratic Compliance Engine — Webhook Delivery
//
// Delivers webhook events to registered endpoints for a committee.
// Designed to be fire-and-forget: failures are logged but never thrown.

import { createPartyStackClient } from "../../app/(developer)/lib/partystack-db";

export async function deliverWebhook(
  committeeId: string,
  event:
    | "contribution.created"
    | "contribution.limit_reached"
    | "disbursement.created",
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const ps = createPartyStackClient();

    const { data: endpoints, error } = await ps
      .from("webhook_endpoints")
      .select("id, url")
      .eq("committee_id", committeeId)
      .eq("active", true);

    if (error || !endpoints || endpoints.length === 0) return;

    const timestamp = new Date().toISOString();
    const body = JSON.stringify({ event, timestamp, data: payload });

    for (const endpoint of endpoints) {
      const deliveryId = crypto.randomUUID();
      let statusCode: number | null = null;
      let success = false;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Mesocrats-Event": event,
            "X-Mesocrats-Delivery": deliveryId,
            "X-Mesocrats-Timestamp": timestamp,
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        statusCode = res.status;
        success = res.ok;
      } catch {
        // Network error or timeout — logged below
      }

      try {
        await ps.from("webhook_deliveries").insert({
          endpoint_id: endpoint.id,
          event,
          payload,
          status_code: statusCode,
          success,
          delivered_at: timestamp,
        });
      } catch {
        // Table may not exist yet — silently ignore
      }
    }
  } catch {
    // Defensive: if anything fails (e.g. table doesn't exist), return silently
  }
}

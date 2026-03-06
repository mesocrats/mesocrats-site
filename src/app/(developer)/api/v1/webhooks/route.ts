import { NextRequest } from "next/server";
import { createPartyStackClient } from "../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess } from "../middleware";
import { logAudit, clientIp } from "../utils";

/**
 * POST /api/v1/webhooks — create a webhook endpoint
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, auth.rateLimit);
  }

  const url = ((body.url as string) || "").trim();
  const description = ((body.description as string) || "").trim() || null;

  if (!url || !url.startsWith("https://")) {
    return apiError("url is required and must start with https://", 400, auth.rateLimit);
  }

  try {
    new URL(url);
  } catch {
    return apiError("Invalid URL format", 400, auth.rateLimit);
  }

  const ps = createPartyStackClient();

  const { data: endpoint, error } = await ps
    .from("webhook_endpoints")
    .insert({
      committee_id: auth.committeeId,
      url,
      description,
      active: true,
    })
    .select()
    .single();

  if (error) return apiError(error.message, 500, auth.rateLimit);

  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "create",
    tableName: "webhook_endpoints",
    recordId: endpoint.id,
    newValue: endpoint,
    ipAddress: clientIp(request),
  });

  return apiSuccess(endpoint, 201, auth.rateLimit);
}

import { NextRequest } from "next/server";
import { createPartyStackClient } from "../../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess } from "../../middleware";
import { logAudit, clientIp } from "../../utils";

/**
 * DELETE /api/v1/webhooks/:id — delete a webhook endpoint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { id } = await params;
  const ps = createPartyStackClient();

  // Verify ownership
  const { data: existing, error: lookupErr } = await ps
    .from("webhook_endpoints")
    .select("id")
    .eq("id", id)
    .eq("committee_id", auth.committeeId)
    .single();

  if (lookupErr || !existing) {
    return apiError("Webhook endpoint not found", 404, auth.rateLimit);
  }

  const { error } = await ps
    .from("webhook_endpoints")
    .delete()
    .eq("id", id)
    .eq("committee_id", auth.committeeId);

  if (error) return apiError(error.message, 500, auth.rateLimit);

  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "delete",
    tableName: "webhook_endpoints",
    recordId: id,
    ipAddress: clientIp(request),
  });

  return apiSuccess({ deleted: true }, 200, auth.rateLimit);
}

/**
 * PATCH /api/v1/webhooks/:id — toggle active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, auth.rateLimit);
  }

  if (typeof body.active !== "boolean") {
    return apiError("active (boolean) is required", 400, auth.rateLimit);
  }

  const ps = createPartyStackClient();

  // Verify ownership
  const { data: existing, error: lookupErr } = await ps
    .from("webhook_endpoints")
    .select("id, active")
    .eq("id", id)
    .eq("committee_id", auth.committeeId)
    .single();

  if (lookupErr || !existing) {
    return apiError("Webhook endpoint not found", 404, auth.rateLimit);
  }

  const { data: updated, error } = await ps
    .from("webhook_endpoints")
    .update({ active: body.active })
    .eq("id", id)
    .eq("committee_id", auth.committeeId)
    .select()
    .single();

  if (error) return apiError(error.message, 500, auth.rateLimit);

  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "update",
    tableName: "webhook_endpoints",
    recordId: id,
    oldValue: { active: existing.active },
    newValue: { active: body.active },
    ipAddress: clientIp(request),
  });

  return apiSuccess(updated, 200, auth.rateLimit);
}

import { NextRequest } from "next/server";
import { createPartyStackClient } from "../../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess } from "../../middleware";

/**
 * GET /api/v1/contributions/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { id } = await params;

  const ps = createPartyStackClient();
  const { data: contribution, error } = await ps
    .from("contributions")
    .select("*")
    .eq("id", id)
    .eq("committee_id", auth.committeeId)
    .single();

  if (error || !contribution) {
    return apiError("Contribution not found", 404, auth.rateLimit);
  }

  return apiSuccess(contribution, 200, auth.rateLimit);
}

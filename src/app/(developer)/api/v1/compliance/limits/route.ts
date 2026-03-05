import { NextRequest } from "next/server";
import { createPartyStackClient } from "../../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess } from "../../middleware";

// FEC contribution limits — 2025-2026 cycle (cents)
const LIMITS: Record<
  string,
  { individual_per_year: number | null; pac_per_year: number | null; party_per_year: number | null }
> = {
  national_party: {
    individual_per_year: 4_130_000,
    pac_per_year: 500_000,
    party_per_year: null, // unlimited transfers between party committees
  },
  state_party: {
    individual_per_year: 1_000_000,
    pac_per_year: 500_000,
    party_per_year: null,
  },
  pac: {
    individual_per_year: 500_000,
    pac_per_year: 500_000,
    party_per_year: 500_000,
  },
  super_pac: {
    individual_per_year: null, // unlimited
    pac_per_year: null,
    party_per_year: null,
  },
  candidate: {
    individual_per_year: 330_000,
    pac_per_year: 500_000,
    party_per_year: null,
  },
};

/**
 * GET /api/v1/compliance/limits
 *
 * Returns FEC contribution limits for the authenticated committee's type.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const ps = createPartyStackClient();
  const { data: committee, error } = await ps
    .from("committees")
    .select("committee_type")
    .eq("id", auth.committeeId)
    .single();

  if (error) return apiError(error.message, 500, auth.rateLimit);

  const type = committee.committee_type as string;
  const limits = LIMITS[type] || LIMITS.pac;

  return apiSuccess({
    committee_type: type,
    cycle: "2025-2026",
    limits,
    itemization_threshold: 20_000,
  }, 200, auth.rateLimit);
}

import { NextRequest, NextResponse } from "next/server";
import { createPartyStackClient } from "../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess, setRateLimitHeaders } from "../middleware";
import {
  parsePagination,
  paginationMeta,
  logAudit,
  isValidDate,
  clientIp,
} from "../utils";
import { deliverWebhook } from "../../../../../lib/mce/webhooks";

// FEC individual contribution limits per year by committee type (cents)
// 2025-2026 cycle
const INDIVIDUAL_LIMITS: Record<string, number | null> = {
  national_party: 4_130_000,
  state_party: 1_000_000,
  pac: 500_000,
  candidate: 330_000,
  super_pac: null, // unlimited
};

const ITEMIZATION_THRESHOLD = 20_000; // $200 in cents

/**
 * GET /api/v1/contributions
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const contributorId = searchParams.get("contributor_id");
  const itemized = searchParams.get("itemized");

  const ps = createPartyStackClient();

  let query = ps
    .from("contributions")
    .select("*", { count: "exact" })
    .eq("committee_id", auth.committeeId)
    .order("date_received", { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) query = query.gte("date_received", startDate);
  if (endDate) query = query.lte("date_received", endDate);
  if (contributorId) query = query.eq("contributor_id", contributorId);
  if (itemized === "true") query = query.eq("itemized", true);
  if (itemized === "false") query = query.eq("itemized", false);

  const { data, error, count } = await query;

  if (error) return apiError(error.message, 500, auth.rateLimit);

  const res = NextResponse.json(
    { data, pagination: paginationMeta(page, limit, count ?? 0) },
    { status: 200 }
  );
  return setRateLimitHeaders(res, auth.rateLimit);
}

/**
 * POST /api/v1/contributions
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const contributorId = ((body.contributor_id as string) || "").trim();
  const amountCents = body.amount_cents as number | undefined;
  const dateReceived = ((body.date_received as string) || "").trim();

  // ── Basic validation ──────────────────────────────────────
  const errors: string[] = [];
  if (!contributorId) errors.push("contributor_id is required");
  if (amountCents === undefined || amountCents < 100)
    errors.push("amount_cents must be >= 100 (minimum $1.00)");
  if (!dateReceived || !isValidDate(dateReceived))
    errors.push("date_received is required and must be YYYY-MM-DD");

  if (errors.length > 0) return apiError(errors.join("; "), 400, auth.rateLimit);

  const ps = createPartyStackClient();

  // ── Verify contributor belongs to this committee ──────────
  const { data: contributor, error: contribErr } = await ps
    .from("contributors")
    .select("id")
    .eq("id", contributorId)
    .eq("committee_id", auth.committeeId)
    .single();

  if (contribErr || !contributor) {
    return apiError(
      "contributor_id not found or does not belong to this committee",
      404,
      auth.rateLimit
    );
  }

  // ── Look up committee type for limit check ────────────────
  const { data: committee, error: cmtErr } = await ps
    .from("committees")
    .select("committee_type")
    .eq("id", auth.committeeId)
    .single();

  if (cmtErr || !committee) return apiError("Committee not found", 500, auth.rateLimit);

  const calendarYear = new Date(dateReceived).getFullYear();

  // ── Read or init aggregate ────────────────────────────────
  const { data: existingAgg } = await ps
    .from("aggregates")
    .select("*")
    .eq("contributor_id", contributorId)
    .eq("committee_id", auth.committeeId)
    .eq("calendar_year", calendarYear)
    .single();

  const currentTotal = existingAgg?.total_cents ?? 0;
  const newTotal = currentTotal + amountCents!;

  // ── FEC limit check ───────────────────────────────────────
  const limitCents =
    INDIVIDUAL_LIMITS[committee.committee_type as string] ?? null;

  if (limitCents !== null && newTotal > limitCents) {
    const limitDollars = (limitCents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    const currentDollars = (currentTotal / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    const attemptDollars = (amountCents! / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    return apiError(
      `Contribution would exceed the FEC individual limit of ${limitDollars}/year for ${committee.committee_type} committees. ` +
        `Current YTD aggregate: ${currentDollars}. Attempted: ${attemptDollars}.`,
      422,
      auth.rateLimit
    );
  }

  // ── Insert contribution ───────────────────────────────────
  const itemized = newTotal > ITEMIZATION_THRESHOLD;

  const record = {
    committee_id: auth.committeeId,
    contributor_id: contributorId,
    amount_cents: amountCents!,
    date_received: dateReceived,
    contribution_type:
      ((body.contribution_type as string) || "individual").trim(),
    payment_method:
      ((body.payment_method as string) || "").trim() || null,
    stripe_charge_id:
      ((body.stripe_charge_id as string) || "").trim() || null,
    frequency: ((body.frequency as string) || "one_time").trim(),
    citizenship_attested: Boolean(body.citizenship_attested),
    personal_funds_attested: Boolean(body.personal_funds_attested),
    non_contractor_attested: Boolean(body.non_contractor_attested),
    personal_card_attested: Boolean(body.personal_card_attested),
    age_attested: Boolean(body.age_attested),
    ip_address:
      ((body.ip_address as string) || "").trim() || clientIp(request),
    aggregate_ytd_cents: newTotal,
    itemized,
  };

  const { data: contribution, error: insertErr } = await ps
    .from("contributions")
    .insert(record)
    .select()
    .single();

  if (insertErr) return apiError(insertErr.message, 500, auth.rateLimit);

  // ── Upsert aggregate ─────────────────────────────────────
  if (existingAgg) {
    await ps
      .from("aggregates")
      .update({
        total_cents: newTotal,
        contribution_count: existingAgg.contribution_count + 1,
        last_contribution_date: dateReceived,
        itemization_required: itemized,
      })
      .eq("id", existingAgg.id);
  } else {
    await ps.from("aggregates").insert({
      contributor_id: contributorId,
      committee_id: auth.committeeId,
      calendar_year: calendarYear,
      total_cents: amountCents!,
      contribution_count: 1,
      last_contribution_date: dateReceived,
      itemization_required: itemized,
    });
  }

  // ── Audit log ─────────────────────────────────────────────
  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "create",
    tableName: "contributions",
    recordId: contribution.id,
    newValue: contribution,
    ipAddress: clientIp(request),
  });

  // ── Webhooks (fire and forget) ──────────────────────────────
  void deliverWebhook(auth.committeeId, "contribution.created", { contribution });

  // Alert if within $100 (10_000 cents) of FEC limit
  const LIMIT_WARNING_THRESHOLD = 10_000;
  if (limitCents !== null && newTotal >= limitCents - LIMIT_WARNING_THRESHOLD) {
    void deliverWebhook(auth.committeeId, "contribution.limit_reached", {
      contribution,
      aggregate_ytd_cents: newTotal,
      limit_cents: limitCents,
      remaining_cents: limitCents - newTotal,
    });
  }

  return apiSuccess(
    {
      ...contribution,
      aggregate: {
        calendar_year: calendarYear,
        total_cents: newTotal,
        contribution_count: (existingAgg?.contribution_count ?? 0) + 1,
        itemization_required: itemized,
      },
    },
    201,
    auth.rateLimit
  );
}

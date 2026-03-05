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

const VALID_CATEGORIES = [
  "operating",
  "contribution_to_candidate",
  "independent_expenditure",
  "coordinated_expenditure",
  "other",
] as const;

/**
 * GET /api/v1/disbursements
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const category = searchParams.get("category");

  const ps = createPartyStackClient();

  let query = ps
    .from("disbursements")
    .select("*", { count: "exact" })
    .eq("committee_id", auth.committeeId)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);
  if (category) query = query.eq("category", category);

  const { data, error, count } = await query;

  if (error) return apiError(error.message, 500, auth.rateLimit);

  const res = NextResponse.json(
    { data, pagination: paginationMeta(page, limit, count ?? 0) },
    { status: 200 }
  );
  return setRateLimitHeaders(res, auth.rateLimit);
}

/**
 * POST /api/v1/disbursements
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

  const payeeName = ((body.payee_name as string) || "").trim();
  const purpose = ((body.purpose as string) || "").trim();
  const amountCents = body.amount_cents as number | undefined;
  const date = ((body.date as string) || "").trim();
  const category = ((body.category as string) || "operating").trim();

  // Validation
  const errors: string[] = [];
  if (!payeeName) errors.push("payee_name is required");
  if (!purpose) errors.push("purpose is required");
  if (amountCents === undefined || amountCents < 1)
    errors.push("amount_cents must be >= 1");
  if (!date || !isValidDate(date))
    errors.push("date is required and must be YYYY-MM-DD");
  if (
    !VALID_CATEGORIES.includes(
      category as (typeof VALID_CATEGORIES)[number]
    )
  ) {
    errors.push(
      `category must be one of: ${VALID_CATEGORIES.join(", ")}`
    );
  }

  if (errors.length > 0) {
    return apiError(errors.join("; "), 400, auth.rateLimit);
  }

  const record = {
    committee_id: auth.committeeId,
    payee_name: payeeName,
    payee_address: ((body.payee_address as string) || "").trim() || null,
    amount_cents: amountCents!,
    date,
    purpose,
    category,
    check_number: ((body.check_number as string) || "").trim() || null,
    receipt_url: ((body.receipt_url as string) || "").trim() || null,
  };

  const ps = createPartyStackClient();
  const { data: disbursement, error } = await ps
    .from("disbursements")
    .insert(record)
    .select()
    .single();

  if (error) return apiError(error.message, 500, auth.rateLimit);

  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "create",
    tableName: "disbursements",
    recordId: disbursement.id,
    newValue: disbursement,
    ipAddress: clientIp(request),
  });

  return apiSuccess(disbursement, 201, auth.rateLimit);
}

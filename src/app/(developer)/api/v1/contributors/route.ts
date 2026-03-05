import { NextRequest, NextResponse } from "next/server";
import { createPartyStackClient } from "../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess, setRateLimitHeaders } from "../middleware";
import { parsePagination, paginationMeta, logAudit, clientIp } from "../utils";

/**
 * GET /api/v1/contributors
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();

  const ps = createPartyStackClient();

  let query = ps
    .from("contributors")
    .select("*", { count: "exact" })
    .eq("committee_id", auth.committeeId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) return apiError(error.message, 500, auth.rateLimit);

  const res = NextResponse.json(
    { data, pagination: paginationMeta(page, limit, count ?? 0) },
    { status: 200 }
  );
  return setRateLimitHeaders(res, auth.rateLimit);
}

/**
 * POST /api/v1/contributors
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

  const firstName = ((body.first_name as string) || "").trim();
  const lastName = ((body.last_name as string) || "").trim();

  if (!firstName || !lastName) {
    return apiError("first_name and last_name are required", 400, auth.rateLimit);
  }

  const fullName =
    ((body.full_name as string) || "").trim() || `${firstName} ${lastName}`;

  const zipCode = ((body.zip_code as string) || "").trim() || null;
  const matchKey =
    lastName && zipCode
      ? `${lastName.toLowerCase()}_${zipCode}`
      : null;

  const record = {
    committee_id: auth.committeeId,
    entity_type: ((body.entity_type as string) || "individual").trim(),
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: ((body.email as string) || "").trim() || null,
    address_line1: ((body.address_line1 as string) || "").trim() || null,
    address_line2: ((body.address_line2 as string) || "").trim() || null,
    city: ((body.city as string) || "").trim() || null,
    state: ((body.state as string) || "").trim() || null,
    zip_code: zipCode,
    employer: ((body.employer as string) || "").trim() || null,
    occupation: ((body.occupation as string) || "").trim() || null,
    match_key: matchKey,
  };

  const ps = createPartyStackClient();
  const { data: contributor, error } = await ps
    .from("contributors")
    .insert(record)
    .select()
    .single();

  if (error) return apiError(error.message, 500, auth.rateLimit);

  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "create",
    tableName: "contributors",
    recordId: contributor.id,
    newValue: contributor,
    ipAddress: clientIp(request),
  });

  return apiSuccess(contributor, 201, auth.rateLimit);
}

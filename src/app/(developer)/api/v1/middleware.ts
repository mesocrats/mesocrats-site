import { NextResponse } from "next/server";
import { verifyApiKey } from "../../lib/verify-api-key";

// ── Rate limiting ─────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 100;
const WINDOW_MS = 60 * 1000;

export interface RateLimitInfo {
  remaining: number;
  resetAt: number;
}

function checkRateLimit(keyId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = rateLimitMap.get(keyId);

  if (!entry || now > entry.windowStart + WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    rateLimitMap.set(keyId, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= RATE_LIMIT,
    remaining: Math.max(0, RATE_LIMIT - entry.count),
    resetAt: entry.windowStart + WINDOW_MS,
  };
}

export function setRateLimitHeaders(response: NextResponse, rateLimit: RateLimitInfo): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  response.headers.set("X-RateLimit-Reset", new Date(rateLimit.resetAt).toISOString());
  return response;
}

// ── Response helpers ──────────────────────────────────────────

export function apiError(message: string, status: number, rateLimit?: RateLimitInfo) {
  const body: Record<string, unknown> = { error: message };
  if (status === 429 && rateLimit) {
    body.limit = RATE_LIMIT;
    body.remaining = 0;
    body.reset_at = new Date(rateLimit.resetAt).toISOString();
  }
  const res = NextResponse.json(body, { status });
  if (rateLimit) setRateLimitHeaders(res, rateLimit);
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function apiSuccess(data: any, status = 200, rateLimit?: RateLimitInfo) {
  const res = NextResponse.json({ data }, { status });
  if (rateLimit) setRateLimitHeaders(res, rateLimit);
  return res;
}

// ── Auth ──────────────────────────────────────────────────────

type AuthError = { error: string; status: number; rateLimit?: RateLimitInfo };
type AuthSuccess = { userId: string; committeeId: string; keyId: string; rateLimit: RateLimitInfo };

/**
 * Authenticate an API request using a Bearer token.
 * Also applies per-key rate limiting (100 req/min).
 *
 * Returns the verified key info on success, or an error response.
 */
export async function authenticateRequest(
  request: Request
): Promise<AuthError | AuthSuccess> {
  const authHeader = request.headers.get("authorization");
  const keyInfo = await verifyApiKey(authHeader);

  if (!keyInfo) {
    return { error: "Invalid API key", status: 401 };
  }

  if (!keyInfo.committeeId) {
    return {
      error:
        "API key not bound to a committee. Create a committee first via POST /api/v1/committees.",
      status: 403,
    };
  }

  const rl = checkRateLimit(keyInfo.id);

  if (!rl.allowed) {
    return {
      error: "Rate limit exceeded",
      status: 429,
      rateLimit: { remaining: rl.remaining, resetAt: rl.resetAt },
    };
  }

  return {
    userId: keyInfo.userId,
    committeeId: keyInfo.committeeId,
    keyId: keyInfo.id,
    rateLimit: { remaining: rl.remaining, resetAt: rl.resetAt },
  };
}

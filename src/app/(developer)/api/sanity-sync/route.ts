/**
 * POST /api/sanity-sync — Sanity CMS Webhook Handler
 *
 * Receives webhook events from Sanity when content is published and
 * triggers Next.js on-demand revalidation for affected pages.
 *
 * ── Setup Instructions ──────────────────────────────────────────────
 *
 * 1. Generate a webhook secret:
 *      openssl rand -hex 32
 *
 * 2. Add the secret to your environment:
 *    - Vercel: Settings → Environment Variables → SANITY_WEBHOOK_SECRET
 *    - .env.local (for local dev): SANITY_WEBHOOK_SECRET=your_secret
 *
 * 3. Register the webhook in Sanity:
 *    - Go to https://sanity.io/manage → your project → API → Webhooks
 *    - Click "Create webhook"
 *    - Name: "Next.js Revalidation"
 *    - URL: https://developer.mesocrats.org/api/sanity-sync
 *    - Dataset: production
 *    - Trigger on: Create, Update, Delete
 *    - Filter (optional): leave blank to trigger on all document types,
 *      or use: _type in ["policyPage", "page", "newsPost", "faqEntry",
 *      "siteSettings", "teamMember", "formPageContent"]
 *    - Projection: {_type, _id}
 *    - HTTP method: POST
 *    - Secret: paste the same secret from step 1
 *    - Enable webhook
 *
 * 4. The secret must match in BOTH places (Vercel env + Sanity webhook
 *    settings). Sanity signs the request body with HMAC-SHA256 using
 *    this secret and sends it in the `sanity-webhook-signature` header.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Map Sanity document types to the site paths they affect.
 * When a document of a given type changes, all listed paths are revalidated.
 */
const TYPE_TO_PATHS: Record<string, string[]> = {
  policyPage: ["/platform", "/platform/[slug]"],
  page: ["/", "/party/mission", "/about/story", "/party/declaration", "/about/idea", "/about/leadership", "/about/faq", "/party/politics", "/platform/how-it-works", "/ccx/permanent-panels", "/ccx/permanent-panels/free-expression", "/ccx/permanent-panels/religion"],
  newsPost: ["/news", "/news/[slug]"],
  faqEntry: ["/about/faq"],
  siteSettings: ["/", "/platform", "/platform/[slug]", "/news", "/party/mission"],
  teamMember: ["/about/leadership"],
  formPageContent: ["/involved/join", "/involved/volunteer", "/contact", "/candidates/run"],
};

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[sanity-sync] SANITY_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("sanity-webhook-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 401 }
    );
  }

  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let body: { _type?: string; _id?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { _type, _id } = body;

  if (!_type || !_id) {
    return NextResponse.json(
      { error: "Missing _type or _id in webhook payload" },
      { status: 400 }
    );
  }

  // Skip draft documents
  if (_id.startsWith("drafts.")) {
    return NextResponse.json({ skipped: true, reason: "draft document" });
  }

  const paths = TYPE_TO_PATHS[_type];
  if (!paths || paths.length === 0) {
    console.log(
      `[sanity-sync] ${new Date().toISOString()} — Ignoring unknown type: ${_type} (id: ${_id})`
    );
    return NextResponse.json({ skipped: true, reason: "untracked type" });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  console.log(
    `[sanity-sync] ${new Date().toISOString()} — Revalidated ${paths.length} path(s) for ${_type} (id: ${_id}): ${paths.join(", ")}`
  );

  return NextResponse.json({
    revalidated: true,
    type: _type,
    id: _id,
    paths,
  });
}

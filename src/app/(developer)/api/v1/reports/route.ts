import { NextRequest } from "next/server";
import { createPartyStackClient } from "../../../lib/partystack-db";
import { authenticateRequest, apiError, apiSuccess } from "../middleware";
import { logAudit, isValidDate, clientIp } from "../utils";
import { generateFECFile } from "../../../../../lib/mce";
import type {
  FecReport,
  ScheduleALine,
  ScheduleBLine,
  ReportSummary,
} from "../../../../../lib/mce";

const VALID_REPORT_TYPES = [
  "quarterly",
  "monthly",
  "semiannual",
  "year_end",
  "amendment",
] as const;

/**
 * GET /api/v1/reports
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const reportType = searchParams.get("report_type");

  const ps = createPartyStackClient();

  let query = ps
    .from("reports")
    .select("*")
    .eq("committee_id", auth.committeeId)
    .order("coverage_start", { ascending: false });

  if (status) query = query.eq("status", status);
  if (reportType) query = query.eq("report_type", reportType);

  const { data, error } = await query;

  if (error) return apiError(error.message, 500, auth.rateLimit);

  return apiSuccess(data, 200, auth.rateLimit);
}

/**
 * POST /api/v1/reports
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

  const coverageStart = ((body.coverage_start as string) || "").trim();
  const coverageEnd = ((body.coverage_end as string) || "").trim();
  const reportType = ((body.report_type as string) || "quarterly").trim();
  const filingDeadline = ((body.filing_deadline as string) || "").trim() || null;

  // Validation
  const errors: string[] = [];
  if (!coverageStart || !isValidDate(coverageStart))
    errors.push("coverage_start is required and must be YYYY-MM-DD");
  if (!coverageEnd || !isValidDate(coverageEnd))
    errors.push("coverage_end is required and must be YYYY-MM-DD");
  if (
    coverageStart &&
    coverageEnd &&
    isValidDate(coverageStart) &&
    isValidDate(coverageEnd) &&
    coverageStart >= coverageEnd
  ) {
    errors.push("coverage_start must be before coverage_end");
  }
  if (
    !VALID_REPORT_TYPES.includes(
      reportType as (typeof VALID_REPORT_TYPES)[number]
    )
  ) {
    errors.push(
      `report_type must be one of: ${VALID_REPORT_TYPES.join(", ")}`
    );
  }
  if (filingDeadline && !isValidDate(filingDeadline)) {
    errors.push("filing_deadline must be YYYY-MM-DD");
  }

  if (errors.length > 0) {
    return apiError(errors.join("; "), 400, auth.rateLimit);
  }

  const ps = createPartyStackClient();
  const { data: report, error } = await ps
    .from("reports")
    .insert({
      committee_id: auth.committeeId,
      report_type: reportType,
      coverage_start: coverageStart,
      coverage_end: coverageEnd,
      filing_deadline: filingDeadline,
      status: "draft",
    })
    .select()
    .single();

  if (error) return apiError(error.message, 500, auth.rateLimit);

  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "create",
    tableName: "reports",
    recordId: report.id,
    newValue: report,
    ipAddress: clientIp(request),
  });

  // ── Phase 2: Generate .fec file from PartyStack data ────────
  let fecGenerated = false;
  let fecPreview: string | null = null;
  let errorDetail: string | null = null;

  try {
    // Fetch contributions in coverage period (joined with contributors)
    const { data: contributions, error: contribErr } = await ps
      .from("contributions")
      .select(`
        id,
        contributor_id,
        amount_cents,
        date_received,
        aggregate_ytd_cents,
        itemized,
        contributors (
          first_name,
          last_name,
          address_line1,
          city,
          state,
          zip_code,
          employer,
          occupation
        )
      `)
      .eq("committee_id", auth.committeeId)
      .gte("date_received", coverageStart)
      .lte("date_received", coverageEnd)
      .order("date_received", { ascending: true });

    if (contribErr) throw new Error(`Contributions query failed: ${contribErr.message}`);

    // Fetch disbursements in coverage period
    const { data: disbursements, error: disbErr } = await ps
      .from("disbursements")
      .select("*")
      .eq("committee_id", auth.committeeId)
      .gte("date", coverageStart)
      .lte("date", coverageEnd)
      .order("date", { ascending: true });

    if (disbErr) throw new Error(`Disbursements query failed: ${disbErr.message}`);

    if ((!contributions || contributions.length === 0) && (!disbursements || disbursements.length === 0)) {
      throw new Error("No contributions or disbursements found in coverage period");
    }

    // Map contributions to ScheduleALine[] (itemized only)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduleA: ScheduleALine[] = (contributions || []).filter((c: any) => c.itemized).map((c: any) => {
      const contributor = c.contributors;
      return {
        donorId: c.contributor_id,
        donationId: c.id,
        contributorName: contributor ? `${contributor.last_name}, ${contributor.first_name}` : "Unknown",
        contributorAddress: contributor?.address_line1 || "",
        contributorCity: contributor?.city || "",
        contributorState: contributor?.state || "",
        contributorZip: contributor?.zip_code || "",
        employer: contributor?.employer || "",
        occupation: contributor?.occupation || "",
        dateReceived: c.date_received,
        amountCents: c.amount_cents,
        aggregateYtdCents: c.aggregate_ytd_cents || 0,
      };
    });

    // Map disbursements to ScheduleBLine[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduleB: ScheduleBLine[] = (disbursements || []).map((d: any) => ({
      disbursementId: d.id,
      payeeName: d.payee_name,
      payeeAddress: d.payee_address || "",
      payeeCity: "",
      payeeState: "",
      payeeZip: "",
      datePaid: d.date,
      amountCents: d.amount_cents,
      purpose: d.purpose,
      category: d.category,
    }));

    // Build summary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalReceiptsCents = (contributions || []).reduce((sum: number, c: any) => sum + c.amount_cents, 0);
    const itemizedReceiptsCents = scheduleA.reduce((sum, l) => sum + l.amountCents, 0);
    const totalDisbursementsCents = scheduleB.reduce((sum, l) => sum + l.amountCents, 0);

    const disbursementsByCategory: Record<string, number> = {};
    for (const d of scheduleB) {
      disbursementsByCategory[d.category] = (disbursementsByCategory[d.category] || 0) + d.amountCents;
    }

    const summary: ReportSummary = {
      totalReceiptsCents,
      itemizedReceiptsCents,
      unitemizedReceiptsCents: totalReceiptsCents - itemizedReceiptsCents,
      totalDisbursementsCents,
      disbursementsByCategory,
      cashOnHandStartCents: null,
      cashOnHandEndCents: null,
    };

    const year = parseInt(coverageStart.substring(0, 4), 10);

    const fecReport: FecReport = {
      period: {
        type: "quarterly",
        year,
        period: reportType,
        startDate: coverageStart,
        endDate: coverageEnd,
      },
      scheduleA,
      scheduleB,
      summary,
      warnings: [],
      generatedAt: new Date().toISOString(),
    };

    const fecContent = generateFECFile(fecReport);

    // Store .fec content on the report record
    const { error: updateErr } = await ps
      .from("reports")
      .update({ fec_content: fecContent })
      .eq("id", report.id);

    if (updateErr) throw new Error(`Failed to store .fec content: ${updateErr.message}`);

    fecGenerated = true;
    fecPreview = fecContent.substring(0, 200);
  } catch (err) {
    errorDetail = err instanceof Error ? err.message : "FEC generation failed";
  }

  return apiSuccess(
    {
      ...report,
      fec_generated: fecGenerated,
      fec_preview: fecPreview,
      ...(errorDetail ? { error_detail: errorDetail } : {}),
    },
    201,
    auth.rateLimit
  );
}

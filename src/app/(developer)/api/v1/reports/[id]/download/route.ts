import { NextRequest, NextResponse } from "next/server";
import { createPartyStackClient } from "../../../../../lib/partystack-db";
import { authenticateRequest, apiError, setRateLimitHeaders } from "../../../middleware";
import { logAudit, clientIp } from "../../../utils";

/**
 * GET /api/v1/reports/:id/download
 * Download the generated FEC file for a report.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return apiError(auth.error, auth.status, auth.rateLimit);

  const { id } = await params;

  const ps = createPartyStackClient();

  const { data: report, error } = await ps
    .from("reports")
    .select("id, committee_id, fec_content")
    .eq("id", id)
    .eq("committee_id", auth.committeeId)
    .single();

  if (error || !report) {
    return apiError("Report not found", 404, auth.rateLimit);
  }

  if (!report.fec_content) {
    return apiError(
      "FEC file not yet generated for this report",
      400,
      auth.rateLimit
    );
  }

  // Audit log
  logAudit(ps, {
    committeeId: auth.committeeId,
    userId: auth.userId,
    action: "download_fec",
    tableName: "reports",
    recordId: id,
    ipAddress: clientIp(request),
  });

  const res = new NextResponse(report.fec_content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="report-${id}.fec"`,
    },
  });
  return setRateLimitHeaders(res, auth.rateLimit);
}

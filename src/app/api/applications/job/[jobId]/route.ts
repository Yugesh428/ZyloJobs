/**
 * GET /api/applications/job/:jobId
 * Returns all applicants for a specific job (admin use).
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getApplicationsByJob } from "@/backend/features/jobApplication/jobApplicationController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  return getApplicationsByJob(req, jobId);
}

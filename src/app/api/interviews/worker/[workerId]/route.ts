/**
 * GET /api/interviews/worker/:workerId
 * All upcoming/past interviews for a worker (their personal schedule).
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getInterviewsByWorker } from "@/backend/features/interview/interviewController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workerId: string }> },
) {
  const { workerId } = await params;
  return getInterviewsByWorker(req, workerId);
}

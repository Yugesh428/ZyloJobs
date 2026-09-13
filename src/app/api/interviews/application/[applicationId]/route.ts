/**
 * GET /api/interviews/application/:applicationId
 * All interview rounds for a specific application (ordered by round ASC).
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getInterviewsByApplication } from "@/backend/features/interview/interviewController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const { applicationId } = await params;
  return getInterviewsByApplication(req, applicationId);
}

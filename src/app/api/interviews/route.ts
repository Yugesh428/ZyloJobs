/**
 * POST /api/interviews — admin schedules a new interview round
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { createInterview } from "@/backend/features/interview/interviewController";

export async function POST(req: NextRequest) {
  return createInterview(req);
}

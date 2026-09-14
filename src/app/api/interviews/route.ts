/**
 * GET  /api/interviews?page&limit&status&type — get all interviews (admin)
 * POST /api/interviews — admin schedules a new interview round
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { 
  getAllInterviews,
  createInterview 
} from "@/backend/features/interview/interviewController";

export async function GET(req: NextRequest) {
  return getAllInterviews(req);
}

export async function POST(req: NextRequest) {
  return createInterview(req);
}

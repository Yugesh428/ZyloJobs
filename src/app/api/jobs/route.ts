/**
 * GET  /api/jobs  — paginated job listings (public)
 * POST /api/jobs  — admin creates a job
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllJobs,
  createJob,
} from "@/backend/features/jobCreation/jobCreationController";

export async function GET(req: NextRequest) {
  return getAllJobs(req);
}

export async function POST(req: NextRequest) {
  return createJob(req);
}

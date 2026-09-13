/**
 * GET /api/applications/me?workerId=<id>
 * Returns all applications submitted by a specific worker.
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getMyApplications } from "@/backend/features/jobApplication/jobApplicationController";

export async function GET(req: NextRequest) {
  return getMyApplications(req);
}

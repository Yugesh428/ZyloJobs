/**
 * GET  /api/applications?page&limit&status — get all applications (admin)
 * POST /api/applications  — worker submits a job application (multipart/form-data)
 * GET  /api/applications/me?workerId=<id>  — handled in /me/route.ts
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { 
  getAllApplications,
  createApplication 
} from "@/backend/features/jobApplication/jobApplicationController";

export async function GET(req: NextRequest) {
  return getAllApplications(req);
}

export async function POST(req: NextRequest) {
  return createApplication(req);
}

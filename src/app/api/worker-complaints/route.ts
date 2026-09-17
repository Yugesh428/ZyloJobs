/**
 * GET  /api/worker-complaints  — list all complaints against workers (admin)
 * POST /api/worker-complaints  — company files a complaint against a worker
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllComplaints,
  createComplaint,
} from "@/backend/features/workerComplaint/workerComplaintController";

export async function GET(req: NextRequest) {
  return getAllComplaints(req);
}

export async function POST(req: NextRequest) {
  return createComplaint(req);
}

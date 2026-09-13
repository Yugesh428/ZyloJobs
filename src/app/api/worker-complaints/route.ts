/**
 * GET  /api/worker-complaints  — list all worker complaints (admin/company)
 * POST /api/worker-complaints  — worker submits a complaint
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllWorkerComplaints,
  createWorkerComplaint,
} from "@/backend/features/workerComplaint/workerComplaintController";

export async function GET(req: NextRequest) {
  return getAllWorkerComplaints(req);
}

export async function POST(req: NextRequest) {
  return createWorkerComplaint(req);
}

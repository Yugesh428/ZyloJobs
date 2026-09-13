/**
 * GET  /api/worker-requests  — list all worker requests (admin/company)
 * POST /api/worker-requests  — worker submits a request
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllWorkerRequests,
  createWorkerRequest,
} from "@/backend/features/workerRequest/workerRequestController";

export async function GET(req: NextRequest) {
  return getAllWorkerRequests(req);
}

export async function POST(req: NextRequest) {
  return createWorkerRequest(req);
}

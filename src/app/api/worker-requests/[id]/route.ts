/**
 * GET    /api/worker-requests/[id]  — get single request details
 * PATCH  /api/worker-requests/[id]  — update request (status, response, etc.)
 * DELETE /api/worker-requests/[id]  — delete request (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getWorkerRequestById,
  updateWorkerRequest,
  deleteWorkerRequest,
} from "@/backend/features/workerRequest/workerRequestController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getWorkerRequestById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateWorkerRequest(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteWorkerRequest(req, id);
}

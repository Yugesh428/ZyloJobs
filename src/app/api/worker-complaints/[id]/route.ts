/**
 * GET    /api/worker-complaints/[id]  — get single complaint details
 * PATCH  /api/worker-complaints/[id]  — update complaint (status, response, etc.)
 * DELETE /api/worker-complaints/[id]  — delete complaint (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getWorkerComplaintById,
  updateWorkerComplaint,
  deleteWorkerComplaint,
} from "@/backend/features/workerComplaint/workerComplaintController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getWorkerComplaintById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateWorkerComplaint(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteWorkerComplaint(req, id);
}

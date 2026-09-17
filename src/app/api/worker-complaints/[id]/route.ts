/**
 * GET    /api/worker-complaints/[id]  — single complaint
 * PATCH  /api/worker-complaints/[id]  — admin resolves/updates
 * DELETE /api/worker-complaints/[id]  — remove complaint
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} from "@/backend/features/workerComplaint/workerComplaintController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getComplaintById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateComplaint(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteComplaint(req, id);
}

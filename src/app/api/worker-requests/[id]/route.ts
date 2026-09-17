/**
 * GET    /api/worker-requests/:id  — get single worker request
 * PUT    /api/worker-requests/:id  — update worker request
 * DELETE /api/worker-requests/:id  — delete worker request
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getWorkerRequestById,
  updateWorkerRequest,
  deleteWorkerRequest,
} from "@/backend/features/workerRequest/workerRequestController";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return getWorkerRequestById(req, id);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return updateWorkerRequest(req, id);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return deleteWorkerRequest(req, id);
}

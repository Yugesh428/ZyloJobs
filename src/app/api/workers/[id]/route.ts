import { NextRequest } from "next/server";
import {
  getWorkerById,
  updateWorkerByAdmin,
  deleteWorker,
} from "@/backend/features/worker/workerController";

/**
 * GET /api/workers/:id — Admin only, get single worker
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return getWorkerById(req, id);
}

/**
 * PUT /api/workers/:id — Admin only, update worker status/availability
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return updateWorkerByAdmin(req, id);
}

/**
 * DELETE /api/workers/:id — Admin only, delete worker
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return deleteWorker(req, id);
}

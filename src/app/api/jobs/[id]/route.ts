/**
 * GET    /api/jobs/:id  — single job detail
 * PUT    /api/jobs/:id  — admin updates job
 * DELETE /api/jobs/:id  — admin deletes job
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getJobById,
  updateJob,
  deleteJob,
} from "@/backend/features/jobCreation/jobCreationController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getJobById(req, id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateJob(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteJob(req, id);
}

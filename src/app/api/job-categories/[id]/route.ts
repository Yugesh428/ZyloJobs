/**
 * GET    /api/job-categories/:id  — get job category by UUID
 * PUT    /api/job-categories/:id  — update job category
 * DELETE /api/job-categories/:id  — delete job category
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getJobCategoryById,
  updateJobCategory,
  deleteJobCategory,
} from "@/backend/features/jobCategoryCreation/jobCategoryController";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return getJobCategoryById(req, id);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return updateJobCategory(req, id);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return deleteJobCategory(req, id);
}

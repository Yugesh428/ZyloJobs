/**
 * PATCH  /api/applications/:id        — update application status (admin)
 * DELETE /api/applications/:id        — worker withdraws application
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  updateApplicationStatus,
  deleteApplication,
} from "@/backend/features/jobApplication/jobApplicationController";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateApplicationStatus(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteApplication(req, id);
}

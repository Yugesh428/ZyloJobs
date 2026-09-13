/**
 * PATCH /api/jobs/:id/status — admin updates job status only
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { updateJobStatus } from "@/backend/features/jobCreation/jobCreationController";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateJobStatus(req, id);
}

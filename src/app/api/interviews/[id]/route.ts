/**
 * GET    /api/interviews/:id — single interview detail
 * PATCH  /api/interviews/:id — update details / status / feedback
 * DELETE /api/interviews/:id — remove interview
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getInterviewById,
  updateInterview,
  deleteInterview,
} from "@/backend/features/interview/interviewController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getInterviewById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateInterview(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteInterview(req, id);
}

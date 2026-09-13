/**
 * GET    /api/attendance/:id — single record
 * PATCH  /api/attendance/:id — admin correction
 * DELETE /api/attendance/:id — admin removes duplicate
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} from "@/backend/features/attendance/attendanceController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getAttendanceById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateAttendance(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteAttendance(req, id);
}

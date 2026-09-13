/**
 * GET  /api/attendance  — list / timesheet with filters
 * POST /api/attendance  — admin manually creates a record
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAttendance,
  createAttendance,
} from "@/backend/features/attendance/attendanceController";

export async function GET(req: NextRequest) {
  return getAttendance(req);
}

export async function POST(req: NextRequest) {
  return createAttendance(req);
}

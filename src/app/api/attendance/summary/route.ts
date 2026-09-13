/**
 * GET /api/attendance/summary?workerId=&month=YYYY-MM
 * Monthly summary: totals per status + all records for that month
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getAttendanceSummary } from "@/backend/features/attendance/attendanceController";

export async function GET(req: NextRequest) {
  return getAttendanceSummary(req);
}

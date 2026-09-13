/**
 * POST /api/attendance/clock-in — worker punches in for the day
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { clockIn } from "@/backend/features/attendance/attendanceController";

export async function POST(req: NextRequest) {
  return clockIn(req);
}

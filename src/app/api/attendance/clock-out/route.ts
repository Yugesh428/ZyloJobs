/**
 * POST /api/attendance/clock-out — worker punches out, computes hours
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { clockOut } from "@/backend/features/attendance/attendanceController";

export async function POST(req: NextRequest) {
  return clockOut(req);
}

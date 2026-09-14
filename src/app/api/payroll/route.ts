/**
 * GET  /api/payroll  — list all payroll records (with filters)
 * POST /api/payroll  — create new payroll record (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllPayrolls,
  createPayroll,
} from "@/backend/features/payroll/payrollController";

export async function GET(req: NextRequest) {
  return getAllPayrolls(req);
}

export async function POST(req: NextRequest) {
  return createPayroll(req);
}

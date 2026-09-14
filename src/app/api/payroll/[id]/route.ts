/**
 * GET    /api/payroll/[id]  — get single payroll record
 * PATCH  /api/payroll/[id]  — update payroll record
 * DELETE /api/payroll/[id]  — delete payroll record (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getPayrollById,
  updatePayroll,
  deletePayroll,
} from "@/backend/features/payroll/payrollController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getPayrollById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updatePayroll(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deletePayroll(req, id);
}

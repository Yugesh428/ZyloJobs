/**
 * GET    /api/company-support/[id]  — get single ticket details
 * PATCH  /api/company-support/[id]  — update ticket (status, response, etc.)
 * DELETE /api/company-support/[id]  — delete ticket (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getCompanySupportTicketById,
  updateCompanySupportTicket,
  deleteCompanySupportTicket,
} from "@/backend/features/companySupport/companySupportController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getCompanySupportTicketById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateCompanySupportTicket(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteCompanySupportTicket(req, id);
}

/**
 * GET    /api/support-tickets/:id  — single ticket
 * PATCH  /api/support-tickets/:id  — admin replies/resolves
 * DELETE /api/support-tickets/:id  — remove ticket
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getSupportTicketById,
  updateSupportTicket,
  deleteSupportTicket,
} from "@/backend/features/workerSupport/workerSupportTicketController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getSupportTicketById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateSupportTicket(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteSupportTicket(req, id);
}

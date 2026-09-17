/**
 * GET  /api/company-support  — admin lists all company support tickets
 * POST /api/company-support  — company submits a ticket
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllCompanySupportTickets,
  createCompanySupportTicket,
} from "@/backend/features/companySupport/companySupportController";

export async function GET(req: NextRequest) {
  return getAllCompanySupportTickets(req);
}

export async function POST(req: NextRequest) {
  return createCompanySupportTicket(req);
}

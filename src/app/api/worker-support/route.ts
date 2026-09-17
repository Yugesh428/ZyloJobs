/**
 * GET  /api/worker-support  — admin lists all worker support tickets
 * POST /api/worker-support  — worker submits a ticket
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllSupportTickets,
  createSupportTicket,
} from "@/backend/features/workerSupport/workerSupportTicketController";

export async function GET(req: NextRequest) {
  return getAllSupportTickets(req);
}

export async function POST(req: NextRequest) {
  return createSupportTicket(req);
}

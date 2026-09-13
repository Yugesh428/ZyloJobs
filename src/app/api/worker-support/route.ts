/**
 * GET  /api/worker-support  — admin lists all worker support tickets
 * POST /api/worker-support  — worker submits a ticket
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllWorkerSupportTickets,
  createWorkerSupportTicket,
} from "@/backend/features/workerSupport/workerSupportTicketController";

export async function GET(req: NextRequest) {
  return getAllWorkerSupportTickets(req);
}

export async function POST(req: NextRequest) {
  return createWorkerSupportTicket(req);
}

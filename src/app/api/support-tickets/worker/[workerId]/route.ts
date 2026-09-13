/**
 * GET /api/support-tickets/worker/:workerId  — all tickets for a specific worker
 * Query: ?status, ?page, ?limit
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getSupportTicketsByWorker } from "@/backend/features/workerSupport/workerSupportTicketController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workerId: string }> },
) {
  const { workerId } = await params;
  return getSupportTicketsByWorker(req, workerId);
}

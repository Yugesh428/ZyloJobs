/**
 * GET /api/worker-requests/company/:companyId
 * All worker requests submitted by a specific company.
 * Supports ?status, ?page, ?limit filters.
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getWorkerRequestsByCompany } from "@/backend/features/workerRequest/workerRequestController";

type Params = { params: Promise<{ companyId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { companyId } = await params;
  return getWorkerRequestsByCompany(req, companyId);
}

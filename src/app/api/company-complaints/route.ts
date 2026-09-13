/**
 * GET  /api/company-complaints  — paginated list (worker complaints about companies)
 * POST /api/company-complaints  — worker files a complaint
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllCompanyComplaints,
  createCompanyComplaint,
} from "@/backend/features/companyComplaint/companyComplaintController";

export async function GET(req: NextRequest) {
  return getAllCompanyComplaints(req);
}

export async function POST(req: NextRequest) {
  return createCompanyComplaint(req);
}

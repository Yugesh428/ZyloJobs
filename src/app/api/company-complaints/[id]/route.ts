/**
 * GET    /api/company-complaints/:id  — single complaint (?asAdmin=true to see anonymous filer)
 * PATCH  /api/company-complaints/:id  — admin resolves/updates
 * DELETE /api/company-complaints/:id  — remove complaint
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getCompanyComplaintById,
  updateCompanyComplaint,
  deleteCompanyComplaint,
} from "@/backend/features/companyComplaint/companyComplaintController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getCompanyComplaintById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateCompanyComplaint(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteCompanyComplaint(req, id);
}

/**
 * GET    /api/companies/:id  — get company by UUID (password excluded)
 * PUT    /api/companies/:id  — update company (admin)
 * DELETE /api/companies/:id  — delete company (admin)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "@/backend/features/companyCreation/companyController";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return getCompanyById(req, id);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return updateCompany(req, id);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return deleteCompany(req, id);
}

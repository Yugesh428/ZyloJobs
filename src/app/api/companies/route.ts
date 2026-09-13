/**
 * GET  /api/companies  — list all companies (admin, password excluded)
 * POST /api/companies  — admin creates a company directly
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getAllCompanies, createCompany } from "@/backend/features/companyCreation/companyController";

export async function GET(req: NextRequest) {
  return getAllCompanies(req);
}

export async function POST(req: NextRequest) {
  return createCompany(req);
}

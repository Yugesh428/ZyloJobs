/**
 * GET /api/companies/code/:companyCode
 * Lookup a company by its unique companyCode string.
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getCompanyByCode } from "@/backend/features/companyCreation/companyController";

type Params = { params: Promise<{ companyCode: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { companyCode } = await params;
  return getCompanyByCode(req, companyCode);
}

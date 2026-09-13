/**
 * POST /api/companies/register
 * Public endpoint — company submits a demo/registration request from the frontend.
 * Password is hashed, status set to "pending" until admin activates.
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { registerCompany } from "@/backend/features/companyCreation/companyController";

export async function POST(req: NextRequest) {
  return registerCompany(req);
}

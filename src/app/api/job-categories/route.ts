/**
 * GET  /api/job-categories  — list all job categories
 * POST /api/job-categories  — create a job category
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getAllJobCategories, createJobCategory } from "@/backend/features/jobCategoryCreation/jobCategoryController";

export async function GET(req: NextRequest) {
  return getAllJobCategories(req);
}

export async function POST(req: NextRequest) {
  return createJobCategory(req);
}

/**
 * GET  /api/onboarding  — paginated list with filters
 * POST /api/onboarding  — admin creates an onboarding record
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllOnboardings,
  createOnboarding,
} from "@/backend/features/onBoarding/onBoardingController";

export async function GET(req: NextRequest) {
  return getAllOnboardings(req);
}

export async function POST(req: NextRequest) {
  return createOnboarding(req);
}

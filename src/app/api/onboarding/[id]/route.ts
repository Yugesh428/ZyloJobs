/**
 * GET    /api/onboarding/:id  — single record with joins
 * PATCH  /api/onboarding/:id  — update status / documents
 * DELETE /api/onboarding/:id  — remove record
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
} from "@/backend/features/onBoarding/onBoardingController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getOnboardingById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateOnboarding(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteOnboarding(req, id);
}

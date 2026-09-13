/**
 * PATCH /api/workers/payment-methods/:workerId/verify
 * Admin marks a worker's payment method as verified before first payout.
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { verifyPaymentMethod } from "@/backend/features/paymentMethod/paymentMethodController";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workerId: string }> },
) {
  const { workerId } = await params;
  return verifyPaymentMethod(req, workerId);
}

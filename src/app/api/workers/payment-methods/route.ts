/**
 * GET /api/workers/payment-methods  — admin lists all workers' payment methods
 * Query: method?, isVerified?, page?, limit?
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getAllPaymentMethods } from "@/backend/features/paymentMethod/paymentMethodController";

export async function GET(req: NextRequest) {
  return getAllPaymentMethods(req);
}

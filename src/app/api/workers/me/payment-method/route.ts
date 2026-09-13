/**
 * GET    /api/workers/me/payment-method?workerId=<id>  — worker gets their method
 * POST   /api/workers/me/payment-method                — worker sets / updates method (upsert)
 * DELETE /api/workers/me/payment-method?workerId=<id>  — worker removes their method
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getPaymentMethod,
  upsertPaymentMethod,
  deletePaymentMethod,
} from "@/backend/features/paymentMethod/paymentMethodController";

export async function GET(req: NextRequest) {
  return getPaymentMethod(req);
}

export async function POST(req: NextRequest) {
  return upsertPaymentMethod(req);
}

export async function DELETE(req: NextRequest) {
  return deletePaymentMethod(req);
}

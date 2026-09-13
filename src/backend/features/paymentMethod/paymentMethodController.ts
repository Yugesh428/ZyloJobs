import { NextRequest, NextResponse } from "next/server";
import WorkerPaymentMethod, {
  type PaymentMethodType,
} from "./paymentMethodModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "PaymentMethodController";

const VALID_METHODS: PaymentMethodType[] = ["bank", "esewa", "khalti"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Strip accountNumber from logs — it is sensitive */
function safeLog(data: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accountNumber: _n, ...safe } = data;
  return safe;
}

/* ------------------------------------------------------------------ */
/* GET /api/workers/me/payment-method?workerId=<id>                   */
/* Worker retrieves their own payment method.                         */
/* ------------------------------------------------------------------ */

export async function getPaymentMethod(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getPaymentMethod — start");

  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId")?.trim();

    if (!workerId) throw new AppError("workerId is required.", 400, "MISSING_PARAM");

    const record = await WorkerPaymentMethod.findOne({ where: { workerId } });

    if (!record) {
      return NextResponse.json(
        { success: true, data: null, message: "No payment method set." },
        { status: 200 },
      );
    }

    logger.info(CTX, "getPaymentMethod — found", safeLog({ workerId, method: record.method }));

    return NextResponse.json({ success: true, data: record }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getPaymentMethod — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/workers/me/payment-method                                */
/* Worker sets or replaces their payment method (upsert).             */
/*                                                                     */
/* Body:                                                               */
/*   workerId      string  (required — from auth session in prod)     */
/*   method        string  bank | esewa | khalti                      */
/*   accountName   string  full name on account                       */
/*   accountNumber string  bank acc / eSewa no / Khalti no            */
/*   bankName      string? required when method = "bank"              */
/*   bankBranch    string? optional, only for bank                    */
/* ------------------------------------------------------------------ */

export async function upsertPaymentMethod(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "upsertPaymentMethod — start");

  try {
    const body = await req.json();
    const {
      workerId,
      method,
      accountName,
      accountNumber,
      bankName,
      bankBranch,
    } = body;

    // ── Validation ────────────────────────────────────────────────────
    if (!workerId?.trim())
      throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");

    if (!method || !VALID_METHODS.includes(method))
      throw new AppError(
        `method must be one of: ${VALID_METHODS.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    if (!accountName?.trim())
      throw new AppError("accountName is required.", 400, "VALIDATION_ERROR");

    if (!accountNumber?.trim())
      throw new AppError("accountNumber is required.", 400, "VALIDATION_ERROR");

    if (method === "bank" && !bankName?.trim())
      throw new AppError(
        "bankName is required when method is bank.",
        400,
        "VALIDATION_ERROR",
      );

    logger.debug(CTX, "upsertPaymentMethod — payload", safeLog({
      workerId,
      method,
      accountName,
      bankName: bankName ?? null,
    }));

    // ── Upsert ────────────────────────────────────────────────────────
    const existing = await WorkerPaymentMethod.findOne({ where: { workerId } });

    if (existing) {
      // Changing method resets verification — admin must re-verify
      const methodChanged = existing.method !== method;

      await existing.update({
        method,
        accountName:   accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName:      method === "bank" ? bankName?.trim() || null : null,
        bankBranch:    method === "bank" ? bankBranch?.trim() || null : null,
        // Reset verification if anything sensitive changed
        isVerified:    methodChanged ? false : existing.isVerified,
      });

      logger.info(CTX, "upsertPaymentMethod — updated", safeLog({
        id: existing.id,
        workerId,
        method,
        methodChanged,
        isVerified: existing.isVerified,
      }));

      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }

    // First time — create
    const record = await WorkerPaymentMethod.create({
      workerId:      workerId.trim(),
      method,
      accountName:   accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankName:      method === "bank" ? bankName?.trim() || null : null,
      bankBranch:    method === "bank" ? bankBranch?.trim() || null : null,
    });

    logger.info(CTX, "upsertPaymentMethod — created", safeLog({
      id: record.id,
      workerId,
      method,
    }));

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "upsertPaymentMethod — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/workers/payment-method/:workerId/verify                 */
/* Admin verifies a worker's payment method before first payout.      */
/* ------------------------------------------------------------------ */

export async function verifyPaymentMethod(
  _req: NextRequest,
  workerId: string,
): Promise<NextResponse> {
  logger.info(CTX, "verifyPaymentMethod — start", { workerId });

  try {
    if (!workerId) throw new AppError("workerId is required.", 400, "MISSING_PARAM");

    const record = await WorkerPaymentMethod.findOne({ where: { workerId } });
    if (!record) {
      throw new AppError(
        "No payment method found for this worker.",
        404,
        "NOT_FOUND",
      );
    }

    if (record.isVerified) {
      return NextResponse.json(
        { success: true, message: "Already verified.", data: record },
        { status: 200 },
      );
    }

    await record.update({ isVerified: true });

    logger.info(CTX, "verifyPaymentMethod — verified", { workerId, method: record.method });

    return NextResponse.json(
      { success: true, message: "Payment method verified.", data: record },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "verifyPaymentMethod — failed", { workerId, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/workers/me/payment-method?workerId=<id>                */
/* Worker removes their payment method.                               */
/* ------------------------------------------------------------------ */

export async function deletePaymentMethod(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "deletePaymentMethod — start");

  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId")?.trim();

    if (!workerId) throw new AppError("workerId is required.", 400, "MISSING_PARAM");

    const record = await WorkerPaymentMethod.findOne({ where: { workerId } });
    if (!record) {
      throw new AppError("No payment method found.", 404, "NOT_FOUND");
    }

    await record.destroy();

    logger.info(CTX, "deletePaymentMethod — deleted", { workerId });

    return NextResponse.json(
      { success: true, message: "Payment method removed.", data: { workerId } },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deletePaymentMethod — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/workers/payment-methods  (admin)                          */
/* List all workers' payment methods with optional filters.           */
/* Query: method?, isVerified?, page?, limit?                         */
/* ------------------------------------------------------------------ */

export async function getAllPaymentMethods(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllPaymentMethods — start");

  try {
    const { searchParams } = new URL(req.url);
    const method     = searchParams.get("method")?.trim();
    const isVerified = searchParams.get("isVerified");
    const page       = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit      = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const offset     = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (method) where.method = method;
    if (isVerified !== null && isVerified !== "") {
      where.isVerified = isVerified === "true";
    }

    const { count, rows } = await WorkerPaymentMethod.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllPaymentMethods — ${rows.length} of ${count}`);

    return NextResponse.json(
      {
        success: true,
        pagination: {
          total:   count,
          page,
          limit,
          pages:   Math.ceil(count / limit),
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1,
        },
        data: rows,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getAllPaymentMethods — failed", error);
    return errorResponse(error);
  }
}

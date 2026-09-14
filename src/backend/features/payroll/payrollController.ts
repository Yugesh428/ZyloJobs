import { NextRequest, NextResponse } from "next/server";
import { Payroll, type PayrollPeriod, type PaymentStatus, type PaymentMethodType } from "./payrollModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";
import { syncDB } from "@/lib/sync";

const CTX = "PayrollController";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/* ------------------------------------------------------------------ */
/* GET /api/payroll — list all payroll records (admin)                */
/* GET /api/payroll?companyId=xxx — company view                      */
/* GET /api/payroll?workerId=xxx — worker view                        */
/* ------------------------------------------------------------------ */

export async function getAllPayrolls(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllPayrolls — start");
  await syncDB();

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    
    const companyId = searchParams.get("companyId")?.trim();
    const workerId = searchParams.get("workerId")?.trim();
    const companyPaymentStatus = searchParams.get("companyPaymentStatus")?.trim();
    const workerPaymentStatus = searchParams.get("workerPaymentStatus")?.trim();
    const period = searchParams.get("period")?.trim();

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (workerId) where.workerId = workerId;
    if (companyPaymentStatus) where.companyPaymentStatus = companyPaymentStatus;
    if (workerPaymentStatus) where.workerPaymentStatus = workerPaymentStatus;
    if (period) where.period = period;

    const { count, rows } = await Payroll.findAndCountAll({
      where,
      order: [["periodStartDate", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllPayrolls — ${rows.length} of ${count}`);

    return NextResponse.json({
      success: true,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
      data: rows,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAllPayrolls — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/payroll/:id                                                */
/* ------------------------------------------------------------------ */

export async function getPayrollById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getPayrollById — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Payroll ID is required.", 400, "MISSING_ID");

    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      logger.warn(CTX, "getPayrollById — not found", { id });
      throw new AppError("Payroll record not found.", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: payroll }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getPayrollById — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/payroll — create payroll record (admin)                  */
/* ------------------------------------------------------------------ */

export async function createPayroll(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createPayroll — start");
  await syncDB();

  try {
    const body = await req.json();
    const {
      onboardingId, workerId, companyId,
      period, periodStartDate, periodEndDate,
      grossSalary, overtimeAmount, bonusAmount, deductions,
      netAmount, companyChargeAmount, companyServiceFeePercent,
      companyPaymentMethod, workerPaymentMethod,
      notes,
    } = body;

    // Validation
    if (!onboardingId) throw new AppError("onboardingId is required.", 400, "VALIDATION_ERROR");
    if (!workerId) throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");
    if (!companyId) throw new AppError("companyId is required.", 400, "VALIDATION_ERROR");
    if (!period) throw new AppError("period is required.", 400, "VALIDATION_ERROR");
    if (!periodStartDate) throw new AppError("periodStartDate is required.", 400, "VALIDATION_ERROR");
    if (!periodEndDate) throw new AppError("periodEndDate is required.", 400, "VALIDATION_ERROR");
    if (grossSalary === undefined || grossSalary === null) throw new AppError("grossSalary is required.", 400, "VALIDATION_ERROR");
    if (netAmount === undefined || netAmount === null) throw new AppError("netAmount is required.", 400, "VALIDATION_ERROR");
    if (companyChargeAmount === undefined || companyChargeAmount === null) throw new AppError("companyChargeAmount is required.", 400, "VALIDATION_ERROR");

    // Check for duplicate
    const existing = await Payroll.findOne({
      where: { onboardingId, periodStartDate, periodEndDate },
    });
    if (existing) {
      throw new AppError("Payroll record already exists for this period.", 409, "DUPLICATE");
    }

    const payroll = await Payroll.create({
      onboardingId,
      workerId,
      companyId,
      period: period as PayrollPeriod,
      periodStartDate,
      periodEndDate,
      grossSalary,
      overtimeAmount: overtimeAmount ?? 0,
      bonusAmount: bonusAmount ?? 0,
      deductions: deductions ?? 0,
      netAmount,
      companyChargeAmount,
      companyServiceFeePercent: companyServiceFeePercent ?? 10.0,
      companyPaymentMethod: companyPaymentMethod ?? "bank",
      workerPaymentMethod: workerPaymentMethod ?? "bank",
      notes: notes ?? null,
    });

    logger.info(CTX, "createPayroll — created", { id: payroll.id });

    return NextResponse.json({
      success: true,
      data: payroll,
    }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createPayroll — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/payroll/:id — update payroll (admin)                    */
/* ------------------------------------------------------------------ */

export async function updatePayroll(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updatePayroll — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Payroll ID is required.", 400, "MISSING_ID");

    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      logger.warn(CTX, "updatePayroll — not found", { id });
      throw new AppError("Payroll record not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const updates: Partial<{
      grossSalary: number;
      overtimeAmount: number;
      bonusAmount: number;
      deductions: number;
      netAmount: number;
      companyChargeAmount: number;
      companyServiceFeePercent: number;
      companyPaymentMethod: PaymentMethodType;
      companyPaymentStatus: PaymentStatus;
      companyPaymentDate: Date | null;
      companyTransactionId: string | null;
      workerPaymentMethod: PaymentMethodType;
      workerPaymentStatus: PaymentStatus;
      workerPaymentDate: Date | null;
      workerTransactionId: string | null;
      notes: string | null;
    }> = {};

    // Update allowed fields
    if (body.grossSalary !== undefined) updates.grossSalary = body.grossSalary;
    if (body.overtimeAmount !== undefined) updates.overtimeAmount = body.overtimeAmount;
    if (body.bonusAmount !== undefined) updates.bonusAmount = body.bonusAmount;
    if (body.deductions !== undefined) updates.deductions = body.deductions;
    if (body.netAmount !== undefined) updates.netAmount = body.netAmount;
    if (body.companyChargeAmount !== undefined) updates.companyChargeAmount = body.companyChargeAmount;
    if (body.companyServiceFeePercent !== undefined) updates.companyServiceFeePercent = body.companyServiceFeePercent;
    if (body.companyPaymentMethod !== undefined) updates.companyPaymentMethod = body.companyPaymentMethod;
    if (body.companyPaymentStatus !== undefined) updates.companyPaymentStatus = body.companyPaymentStatus;
    if (body.companyPaymentDate !== undefined) updates.companyPaymentDate = body.companyPaymentDate;
    if (body.companyTransactionId !== undefined) updates.companyTransactionId = body.companyTransactionId;
    if (body.workerPaymentMethod !== undefined) updates.workerPaymentMethod = body.workerPaymentMethod;
    if (body.workerPaymentStatus !== undefined) updates.workerPaymentStatus = body.workerPaymentStatus;
    if (body.workerPaymentDate !== undefined) updates.workerPaymentDate = body.workerPaymentDate;
    if (body.workerTransactionId !== undefined) updates.workerTransactionId = body.workerTransactionId;
    if (body.notes !== undefined) updates.notes = body.notes;

    await payroll.update(updates);

    logger.info(CTX, "updatePayroll — updated", { id });

    return NextResponse.json({ success: true, data: payroll }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updatePayroll — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/payroll/:id — delete payroll (admin)                   */
/* ------------------------------------------------------------------ */

export async function deletePayroll(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deletePayroll — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Payroll ID is required.", 400, "MISSING_ID");

    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      logger.warn(CTX, "deletePayroll — not found", { id });
      throw new AppError("Payroll record not found.", 404, "NOT_FOUND");
    }

    await payroll.destroy();

    logger.info(CTX, "deletePayroll — deleted", { id });

    return NextResponse.json({
      success: true,
      message: "Payroll record deleted.",
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deletePayroll — failed", { id, error });
    return errorResponse(error);
  }
}

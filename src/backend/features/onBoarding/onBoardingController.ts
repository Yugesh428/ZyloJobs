import { NextRequest, NextResponse } from "next/server";
import Onboarding, {
  type SalaryPeriod,
  type OnboardingStatus,
} from "./onBoardingModel";
import JobApplication from "../jobApplication/jobApplicationModel";
import { Worker } from "../worker/workerModel";
import Job from "../jobCreation/jobCreationModel";
import { Company } from "../companyCreation/companyModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "OnboardingController";

const SALARY_PERIOD_VALUES: SalaryPeriod[] = ["monthly", "weekly", "daily"];

const STATUS_VALUES: OnboardingStatus[] = [
  "pending",
  "offer_sent",
  "documents_submitted",
  "active",
  "terminated",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInt(val: unknown): number {
  const n = parseInt(String(val), 10);
  return isNaN(n) ? 0 : n;
}

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ─── GET /api/onboarding — list all ───────────────────────────────────────────

export async function getAllOnboardings(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllOnboardings — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const status        = searchParams.get("status")?.trim();
    const workerId      = searchParams.get("workerId")?.trim();
    const jobId         = searchParams.get("jobId")?.trim();
    const companyId     = searchParams.get("companyId")?.trim();
    const applicationId = searchParams.get("applicationId")?.trim();

    const where: Record<string, unknown> = {};

    if (status)        where.status        = status;
    if (workerId)      where.workerId      = workerId;
    if (jobId)         where.jobId         = jobId;
    if (companyId)     where.companyId     = companyId;
    if (applicationId) where.applicationId = applicationId;

    const { count, rows } = await Onboarding.findAndCountAll({
      where,
      include: [
        { model: Worker,  as: "worker",  attributes: ["id", "fullName", "email"] },
        { model: Job,     as: "job",     attributes: ["id", "jobRole", "department"] },
        { model: Company, as: "company", attributes: ["id", "companyName", "companyCode", "industry"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllOnboardings — ${rows.length} of ${count}`);

    return NextResponse.json({
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
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAllOnboardings — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/onboarding/:id ──────────────────────────────────────────────────

export async function getOnboardingById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getOnboardingById — start", { id });

  try {
    if (!id) throw new AppError("Onboarding ID is required.", 400, "MISSING_ID");

    const onboarding = await Onboarding.findByPk(id, {
      include: [
        { model: JobApplication, as: "application" },
        { model: Worker,         as: "worker",  attributes: ["id", "fullName", "email"] },
        { model: Job,            as: "job",     attributes: ["id", "jobRole", "department"] },
        { model: Company,        as: "company", attributes: ["id", "companyName", "companyCode", "industry"] },
      ],
    });

    if (!onboarding) {
      logger.warn(CTX, "getOnboardingById — not found", { id });
      throw new AppError("Onboarding record not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getOnboardingById — found", { id });

    return NextResponse.json({ success: true, data: onboarding }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getOnboardingById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/onboarding ─────────────────────────────────────────────────────
// Body: { applicationId, workerId, jobId, companyId, joiningDate,
//         salaryAmount, salaryPeriod, notes? }

export async function createOnboarding(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createOnboarding — start");

  try {
    const body = await req.json();
    const {
      applicationId,
      workerId,
      jobId,
      companyId,
      joiningDate,
      salaryAmount,
      salaryPeriod,
      notes,
    } = body;

    logger.debug(CTX, "createOnboarding — payload", {
      applicationId, workerId, jobId, companyId,
    });

    // ── Validation ──────────────────────────────────────────────────────
    if (!applicationId?.trim())
      throw new AppError("applicationId is required.", 400, "VALIDATION_ERROR");
    if (!workerId?.trim())
      throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");
    if (!jobId?.trim())
      throw new AppError("jobId is required.", 400, "VALIDATION_ERROR");
    if (!companyId?.trim())
      throw new AppError("companyId is required.", 400, "VALIDATION_ERROR");
    if (!joiningDate?.trim())
      throw new AppError("joiningDate is required.", 400, "VALIDATION_ERROR");

    if (!ISO_DATE_RE.test(joiningDate))
      throw new AppError(
        "joiningDate must be in YYYY-MM-DD format.",
        400,
        "VALIDATION_ERROR",
      );

    const salary = toInt(salaryAmount);
    if (salary < 0)
      throw new AppError("salaryAmount must be >= 0.", 400, "VALIDATION_ERROR");

    if (!SALARY_PERIOD_VALUES.includes(salaryPeriod))
      throw new AppError(
        `salaryPeriod must be one of: ${SALARY_PERIOD_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    // ── Verify related records exist ────────────────────────────────────
    const application = await JobApplication.findByPk(applicationId);
    if (!application)
      throw new AppError("Job application not found.", 404, "APPLICATION_NOT_FOUND");

    const worker = await Worker.findByPk(workerId);
    if (!worker)
      throw new AppError("Worker not found.", 404, "WORKER_NOT_FOUND");

    const job = await Job.findByPk(jobId);
    if (!job)
      throw new AppError("Job not found.", 404, "JOB_NOT_FOUND");

    const company = await Company.findByPk(companyId);
    if (!company)
      throw new AppError("Company not found.", 404, "COMPANY_NOT_FOUND");

    // ── Duplicate check (one onboarding per application) ────────────────
    const existing = await Onboarding.findOne({ where: { applicationId } });
    if (existing) {
      throw new AppError(
        "Onboarding already exists for this application.",
        409,
        "DUPLICATE",
      );
    }

    // ── Create ──────────────────────────────────────────────────────────
    const onboarding = await Onboarding.create({
      applicationId,
      workerId,
      jobId,
      companyId,
      joiningDate,
      salaryAmount: salary,
      salaryPeriod,
      notes: notes?.trim() || null,
    });

    logger.info(CTX, "createOnboarding — created", { id: onboarding.id });

    return NextResponse.json({ success: true, data: onboarding }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createOnboarding — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/onboarding/:id ────────────────────────────────────────────────
// Body: { status?, offerLetterUrl?, contractUrl?, citizenshipUrl?,
//         passportUrl?, ppPhotoUrl?, notes?, joiningDate?,
//         salaryAmount?, salaryPeriod? }

export async function updateOnboarding(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateOnboarding — start", { id });

  try {
    if (!id) throw new AppError("Onboarding ID is required.", 400, "MISSING_ID");

    const onboarding = await Onboarding.findByPk(id);
    if (!onboarding) {
      logger.warn(CTX, "updateOnboarding — not found", { id });
      throw new AppError("Onboarding record not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      status,
      offerLetterUrl,
      contractUrl,
      citizenshipUrl,
      passportUrl,
      ppPhotoUrl,
      notes,
      joiningDate,
      salaryAmount,
      salaryPeriod,
    } = body;

    logger.debug(CTX, "updateOnboarding — payload", { id, status });

    const updates: Partial<{
      status: OnboardingStatus;
      offerLetterUrl: string | null;
      contractUrl: string | null;
      citizenshipUrl: string | null;
      passportUrl: string | null;
      ppPhotoUrl: string | null;
      notes: string | null;
      joiningDate: string;
      salaryAmount: number;
      salaryPeriod: SalaryPeriod;
    }> = {};

    if (status !== undefined) {
      if (!STATUS_VALUES.includes(status))
        throw new AppError(
          `status must be one of: ${STATUS_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.status = status;
    }

    if (offerLetterUrl !== undefined)
      updates.offerLetterUrl = offerLetterUrl?.trim() || null;
    if (contractUrl !== undefined)
      updates.contractUrl = contractUrl?.trim() || null;
    if (citizenshipUrl !== undefined)
      updates.citizenshipUrl = citizenshipUrl?.trim() || null;
    if (passportUrl !== undefined)
      updates.passportUrl = passportUrl?.trim() || null;
    if (ppPhotoUrl !== undefined)
      updates.ppPhotoUrl = ppPhotoUrl?.trim() || null;
    if (notes !== undefined)
      updates.notes = notes?.trim() || null;

    if (joiningDate !== undefined) {
      if (!ISO_DATE_RE.test(joiningDate))
        throw new AppError(
          "joiningDate must be in YYYY-MM-DD format.",
          400,
          "VALIDATION_ERROR",
        );
      updates.joiningDate = joiningDate;
    }

    if (salaryAmount !== undefined) {
      const salary = toInt(salaryAmount);
      if (salary < 0)
        throw new AppError("salaryAmount must be >= 0.", 400, "VALIDATION_ERROR");
      updates.salaryAmount = salary;
    }

    if (salaryPeriod !== undefined) {
      if (!SALARY_PERIOD_VALUES.includes(salaryPeriod))
        throw new AppError(
          `salaryPeriod must be one of: ${SALARY_PERIOD_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.salaryPeriod = salaryPeriod;
    }

    await onboarding.update(updates);

    logger.info(CTX, "updateOnboarding — updated", { id });

    return NextResponse.json({ success: true, data: onboarding }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateOnboarding — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/onboarding/:id ───────────────────────────────────────────────

export async function deleteOnboarding(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteOnboarding — start", { id });

  try {
    if (!id) throw new AppError("Onboarding ID is required.", 400, "MISSING_ID");

    const onboarding = await Onboarding.findByPk(id);
    if (!onboarding) {
      logger.warn(CTX, "deleteOnboarding — not found", { id });
      throw new AppError("Onboarding record not found.", 404, "NOT_FOUND");
    }

    const { applicationId, workerId } = onboarding;
    await onboarding.destroy();

    logger.info(CTX, "deleteOnboarding — deleted", { id, applicationId });

    return NextResponse.json({
      success: true,
      message: "Onboarding record deleted.",
      data: { id, applicationId, workerId },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteOnboarding — failed", { id, error });
    return errorResponse(error);
  }
}
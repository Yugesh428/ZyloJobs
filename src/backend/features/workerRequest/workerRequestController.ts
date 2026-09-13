import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import { WorkerRequest, type ExperienceRequired, type WorkType, type RequestStatus } from "./workerRequestModel";
import { Company } from "@/backend/features/companyCreation/companyModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";
import { syncDB } from "@/lib/sync";

const CTX = "WorkerRequestController";

const EXPERIENCE_VALUES: ExperienceRequired[] = [
  "Fresher", "1-2 years", "3-5 years", "5+ years",
];
const WORK_TYPE_VALUES: WorkType[] = ["On-site", "Remote", "Hybrid"];

/* ------------------------------------------------------------------ */
/* Company include — always join company, never expose password        */
/* ------------------------------------------------------------------ */

const COMPANY_INCLUDE = {
  model: Company,
  as: "company",
  attributes: [
    "id", "companyName", "companyCode", "companyType",
    "industry", "email", "status",
    "registrationNumber", "panNumber",
    "companyDescription", "companyLogo",
    "createdAt", "updatedAt",
    // "password" is intentionally omitted
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function toNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function toArray(val: unknown): string[] | null {
  if (val == null) return null;
  if (Array.isArray(val)) {
    const cleaned = val.map((v) => String(v).trim()).filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  if (typeof val === "string") {
    const cleaned = val.split(",").map((v) => v.trim()).filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  return null;
}

/** Verify the company exists and return it — throws 404 if missing */
async function resolveCompany(companyId: string) {
  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new AppError(
      `Company with id "${companyId}" not found.`,
      404,
      "COMPANY_NOT_FOUND",
    );
  }
  return company;
}

/* ------------------------------------------------------------------ */
/* GET /api/worker-requests                                            */
/* ------------------------------------------------------------------ */

export async function getAllWorkerRequests(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllWorkerRequests — start");
  await syncDB();

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);

    const search             = searchParams.get("search")?.trim();
    const companyId          = searchParams.get("companyId")?.trim();
    const department         = searchParams.get("department")?.trim();
    const experienceRequired = searchParams.get("experienceRequired")?.trim();
    const workType           = searchParams.get("workType")?.trim();
    const status             = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = {};

    if (companyId)          where.companyId          = companyId;
    if (department)         where.department         = department;
    if (experienceRequired) where.experienceRequired = experienceRequired;
    if (workType)           where.workType           = workType;
    if (status)             where.status             = status;

    if (search) {
      where[Op.or as unknown as string] = [
        { department:       { [Op.iLike]: `%${search}%` } },
        { jobRole:          { [Op.iLike]: `%${search}%` } },
        { jobLocation:      { [Op.iLike]: `%${search}%` } },
        { responsibilities: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await WorkerRequest.findAndCountAll({
      where,
      include: [COMPANY_INCLUDE],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllWorkerRequests — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllWorkerRequests — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/worker-requests/:id                                        */
/* ------------------------------------------------------------------ */

export async function getWorkerRequestById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getWorkerRequestById — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Worker request ID is required.", 400, "MISSING_ID");

    const workerRequest = await WorkerRequest.findByPk(id, {
      include: [COMPANY_INCLUDE],
    });

    if (!workerRequest) {
      logger.warn(CTX, "getWorkerRequestById — not found", { id });
      throw new AppError("Worker request not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getWorkerRequestById — found", { id });
    return NextResponse.json({ success: true, data: workerRequest }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getWorkerRequestById — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/worker-requests/company/:companyId                        */
/* All requests for a specific company                                */
/* ------------------------------------------------------------------ */

export async function getWorkerRequestsByCompany(
  req: NextRequest,
  companyId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getWorkerRequestsByCompany — start", { companyId });
  await syncDB();

  try {
    if (!companyId) throw new AppError("companyId is required.", 400, "MISSING_ID");

    // Verify company exists
    await resolveCompany(companyId);

    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = { companyId };
    if (status) where.status = status;

    const { count, rows } = await WorkerRequest.findAndCountAll({
      where,
      include: [COMPANY_INCLUDE],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getWorkerRequestsByCompany — ${rows.length} of ${count}`, { companyId });

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
    logger.error(CTX, "getWorkerRequestsByCompany — failed", { companyId, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/worker-requests                                           */
/* Body: { companyId, department, numberOfWorkers, jobRole,           */
/*         requiredSkills?, experienceRequired, jobLocation,          */
/*         workType, workingHours, responsibilities? }                */
/* ------------------------------------------------------------------ */

export async function createWorkerRequest(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createWorkerRequest — start");
  await syncDB();

  try {
    const body = await req.json();
    const {
      companyId,
      department,
      numberOfWorkers,
      jobRole,
      requiredSkills,
      experienceRequired,
      jobLocation,
      workType,
      workingHours,
      responsibilities,
    } = body;

    logger.debug(CTX, "createWorkerRequest — payload", { companyId, department, jobRole });

    // ── Validation ──────────────────────────────────────────────────────
    if (!companyId?.trim())
      throw new AppError("companyId is required.", 400, "VALIDATION_ERROR");
    if (!department?.trim())
      throw new AppError("department is required.", 400, "VALIDATION_ERROR");
    if (!jobRole?.trim())
      throw new AppError("jobRole is required.", 400, "VALIDATION_ERROR");
    if (!jobLocation?.trim())
      throw new AppError("jobLocation is required.", 400, "VALIDATION_ERROR");
    if (!workingHours?.trim())
      throw new AppError("workingHours is required.", 400, "VALIDATION_ERROR");

    const numWorkers = toNum(numberOfWorkers);
    if (numWorkers < 1)
      throw new AppError("numberOfWorkers must be at least 1.", 400, "VALIDATION_ERROR");

    if (!EXPERIENCE_VALUES.includes(experienceRequired))
      throw new AppError(
        `experienceRequired must be one of: ${EXPERIENCE_VALUES.join(", ")}.`,
        400, "VALIDATION_ERROR",
      );

    if (!WORK_TYPE_VALUES.includes(workType))
      throw new AppError(
        `workType must be one of: ${WORK_TYPE_VALUES.join(", ")}.`,
        400, "VALIDATION_ERROR",
      );

    // ── Verify company exists ───────────────────────────────────────────
    await resolveCompany(companyId.trim());

    // ── Create ──────────────────────────────────────────────────────────
    const workerRequest = await WorkerRequest.create({
      companyId:          companyId.trim(),
      department:         department.trim(),
      numberOfWorkers:    numWorkers,
      jobRole:            jobRole.trim(),
      requiredSkills:     toArray(requiredSkills),
      experienceRequired,
      jobLocation:        jobLocation.trim(),
      workType,
      workingHours:       workingHours.trim(),
      responsibilities:   responsibilities?.trim() || null,
    });

    // Reload with company info included
    const full = await WorkerRequest.findByPk(workerRequest.id, {
      include: [COMPANY_INCLUDE],
    });

    logger.info(CTX, "createWorkerRequest — created", { id: workerRequest.id, companyId });

    return NextResponse.json({ success: true, data: full }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createWorkerRequest — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PUT /api/worker-requests/:id                                        */
/* ------------------------------------------------------------------ */

export async function updateWorkerRequest(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateWorkerRequest — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Worker request ID is required.", 400, "MISSING_ID");

    const workerRequest = await WorkerRequest.findByPk(id);
    if (!workerRequest) {
      logger.warn(CTX, "updateWorkerRequest — not found", { id });
      throw new AppError("Worker request not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      department, numberOfWorkers, jobRole, requiredSkills,
      experienceRequired, jobLocation, workType, workingHours,
      responsibilities, status,
    } = body;

    const updates: Partial<{
      department: string;
      numberOfWorkers: number;
      jobRole: string;
      requiredSkills: string[] | null;
      experienceRequired: ExperienceRequired;
      jobLocation: string;
      workType: WorkType;
      workingHours: string;
      responsibilities: string | null;
      status: RequestStatus;
    }> = {};

    if (department !== undefined) {
      if (!department?.trim()) throw new AppError("department cannot be empty.", 400, "VALIDATION_ERROR");
      updates.department = department.trim();
    }
    if (numberOfWorkers !== undefined) {
      const n = toNum(numberOfWorkers);
      if (n < 1) throw new AppError("numberOfWorkers must be at least 1.", 400, "VALIDATION_ERROR");
      updates.numberOfWorkers = n;
    }
    if (jobRole !== undefined) {
      if (!jobRole?.trim()) throw new AppError("jobRole cannot be empty.", 400, "VALIDATION_ERROR");
      updates.jobRole = jobRole.trim();
    }
    if (requiredSkills !== undefined)  updates.requiredSkills  = toArray(requiredSkills);
    if (jobLocation !== undefined) {
      if (!jobLocation?.trim()) throw new AppError("jobLocation cannot be empty.", 400, "VALIDATION_ERROR");
      updates.jobLocation = jobLocation.trim();
    }
    if (workingHours !== undefined) {
      if (!workingHours?.trim()) throw new AppError("workingHours cannot be empty.", 400, "VALIDATION_ERROR");
      updates.workingHours = workingHours.trim();
    }
    if (responsibilities !== undefined) updates.responsibilities = responsibilities?.trim() || null;
    if (experienceRequired !== undefined) {
      if (!EXPERIENCE_VALUES.includes(experienceRequired))
        throw new AppError(`experienceRequired must be one of: ${EXPERIENCE_VALUES.join(", ")}.`, 400, "VALIDATION_ERROR");
      updates.experienceRequired = experienceRequired;
    }
    if (workType !== undefined) {
      if (!WORK_TYPE_VALUES.includes(workType))
        throw new AppError(`workType must be one of: ${WORK_TYPE_VALUES.join(", ")}.`, 400, "VALIDATION_ERROR");
      updates.workType = workType;
    }
    if (status !== undefined) updates.status = status;

    await workerRequest.update(updates);

    const full = await WorkerRequest.findByPk(id, { include: [COMPANY_INCLUDE] });

    logger.info(CTX, "updateWorkerRequest — updated", { id });
    return NextResponse.json({ success: true, data: full }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateWorkerRequest — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/worker-requests/:id                                     */
/* ------------------------------------------------------------------ */

export async function deleteWorkerRequest(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteWorkerRequest — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Worker request ID is required.", 400, "MISSING_ID");

    const workerRequest = await WorkerRequest.findByPk(id);
    if (!workerRequest) {
      logger.warn(CTX, "deleteWorkerRequest — not found", { id });
      throw new AppError("Worker request not found.", 404, "NOT_FOUND");
    }

    const { companyId, department, jobRole } = workerRequest;
    await workerRequest.destroy();

    logger.info(CTX, "deleteWorkerRequest — deleted", { id, companyId, department, jobRole });

    return NextResponse.json({
      success: true,
      message: "Worker request deleted.",
      data: { id, companyId, department, jobRole },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteWorkerRequest — failed", { id, error });
    return errorResponse(error);
  }
}

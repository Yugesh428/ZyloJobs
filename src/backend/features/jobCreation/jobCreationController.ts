import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Job, {
  type ExperienceRequired,
  type WorkType,
  type JobStatus,
} from "./jobCreationModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "JobController";

const EXPERIENCE_VALUES: ExperienceRequired[] = [
  "Fresher",
  "1-2 years",
  "3-5 years",
  "5+ years",
];

const WORK_TYPE_VALUES: WorkType[] = ["On-site", "Remote", "Hybrid"];

const STATUS_VALUES: JobStatus[] = [
  "pending",
  "processing",
  "fulfilled",
  "cancelled",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parsePagination(sp: URLSearchParams) {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ─── GET /api/jobs — list all ─────────────────────────────────────────────────

export async function getAllJobs(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllJobs — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const department = searchParams.get("department")?.trim();
    const workType = searchParams.get("workType")?.trim();
    const experience = searchParams.get("experienceRequired")?.trim();

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (department) where.department = department;
    if (workType) where.workType = workType;
    if (experience) where.experienceRequired = experience;

    if (search) {
      where[Op.or as unknown as string] = [
        { jobRole: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { jobLocation: { [Op.iLike]: `%${search}%` } },
        { responsibilities: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllJobs — ${rows.length} of ${count}`);

    return NextResponse.json(
      {
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
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getAllJobs — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────

export async function getJobById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getJobById — start", { id });

  try {
    if (!id) throw new AppError("Job ID is required.", 400, "MISSING_ID");

    const job = await Job.findByPk(id);
    if (!job) {
      logger.warn(CTX, "getJobById — not found", { id });
      throw new AppError("Job not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getJobById — found", { id });

    return NextResponse.json({ success: true, data: job }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getJobById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
// Body: { jobRole, department, numberOfWorkers, experienceRequired,
//         jobLocation, workType, workingHours, responsibilities?, status? }

export async function createJob(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createJob — start");

  try {
    const body = await req.json();
    const {
      jobRole,
      department,
      numberOfWorkers,
      experienceRequired,
      jobLocation,
      workType,
      workingHours,
      responsibilities,
      status,
    } = body;

    logger.debug(CTX, "createJob — payload", { jobRole, department });

    // ── Validation ──────────────────────────────────────────────────────
    if (!jobRole?.trim())
      throw new AppError("jobRole is required.", 400, "VALIDATION_ERROR");
    if (!department?.trim())
      throw new AppError("department is required.", 400, "VALIDATION_ERROR");
    if (!jobLocation?.trim())
      throw new AppError("jobLocation is required.", 400, "VALIDATION_ERROR");
    if (!workingHours?.trim())
      throw new AppError("workingHours is required.", 400, "VALIDATION_ERROR");

    const numWorkers = toNum(numberOfWorkers);
    if (numWorkers < 1)
      throw new AppError(
        "numberOfWorkers must be at least 1.",
        400,
        "VALIDATION_ERROR",
      );

    if (!EXPERIENCE_VALUES.includes(experienceRequired))
      throw new AppError(
        `experienceRequired must be one of: ${EXPERIENCE_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    if (!WORK_TYPE_VALUES.includes(workType))
      throw new AppError(
        `workType must be one of: ${WORK_TYPE_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    if (status !== undefined && !STATUS_VALUES.includes(status))
      throw new AppError(
        `status must be one of: ${STATUS_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    // ── Create ──────────────────────────────────────────────────────────
    const job = await Job.create({
      jobRole: jobRole.trim(),
      department: department.trim(),
      numberOfWorkers: numWorkers,
      experienceRequired,
      jobLocation: jobLocation.trim(),
      workType,
      workingHours: workingHours.trim(),
      responsibilities: responsibilities?.trim() || null,
      status: status ?? "pending",
    });

    logger.info(CTX, "createJob — created", { id: job.id });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createJob — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/jobs/:id ────────────────────────────────────────────────────────

export async function updateJob(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateJob — start", { id });

  try {
    if (!id) throw new AppError("Job ID is required.", 400, "MISSING_ID");

    const job = await Job.findByPk(id);
    if (!job) {
      logger.warn(CTX, "updateJob — not found", { id });
      throw new AppError("Job not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      jobRole,
      department,
      numberOfWorkers,
      experienceRequired,
      jobLocation,
      workType,
      workingHours,
      responsibilities,
      status,
    } = body;

    logger.debug(CTX, "updateJob — payload", { id });

    const updates: Partial<{
      jobRole: string;
      department: string;
      numberOfWorkers: number;
      experienceRequired: ExperienceRequired;
      jobLocation: string;
      workType: WorkType;
      workingHours: string;
      responsibilities: string | null;
      status: JobStatus;
    }> = {};

    if (jobRole !== undefined) {
      if (!jobRole?.trim())
        throw new AppError("jobRole cannot be empty.", 400, "VALIDATION_ERROR");
      updates.jobRole = jobRole.trim();
    }

    if (department !== undefined) {
      if (!department?.trim())
        throw new AppError(
          "department cannot be empty.",
          400,
          "VALIDATION_ERROR",
        );
      updates.department = department.trim();
    }

    if (numberOfWorkers !== undefined) {
      const numWorkers = toNum(numberOfWorkers);
      if (numWorkers < 1)
        throw new AppError(
          "numberOfWorkers must be at least 1.",
          400,
          "VALIDATION_ERROR",
        );
      updates.numberOfWorkers = numWorkers;
    }

    if (experienceRequired !== undefined) {
      if (!EXPERIENCE_VALUES.includes(experienceRequired))
        throw new AppError(
          `experienceRequired must be one of: ${EXPERIENCE_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.experienceRequired = experienceRequired;
    }

    if (jobLocation !== undefined) {
      if (!jobLocation?.trim())
        throw new AppError(
          "jobLocation cannot be empty.",
          400,
          "VALIDATION_ERROR",
        );
      updates.jobLocation = jobLocation.trim();
    }

    if (workType !== undefined) {
      if (!WORK_TYPE_VALUES.includes(workType))
        throw new AppError(
          `workType must be one of: ${WORK_TYPE_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.workType = workType;
    }

    if (workingHours !== undefined) {
      if (!workingHours?.trim())
        throw new AppError(
          "workingHours cannot be empty.",
          400,
          "VALIDATION_ERROR",
        );
      updates.workingHours = workingHours.trim();
    }

    if (responsibilities !== undefined) {
      updates.responsibilities = responsibilities?.trim() || null;
    }

    if (status !== undefined) {
      if (!STATUS_VALUES.includes(status))
        throw new AppError(
          `status must be one of: ${STATUS_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.status = status;
    }

    await job.update(updates);

    logger.info(CTX, "updateJob — updated", { id });

    return NextResponse.json({ success: true, data: job }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateJob — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── PATCH /api/jobs/:id/status ───────────────────────────────────────────────
// Body: { status: "pending" | "processing" | "fulfilled" | "cancelled" }

export async function updateJobStatus(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateJobStatus — start", { id });

  try {
    if (!id) throw new AppError("Job ID is required.", 400, "MISSING_ID");

    const job = await Job.findByPk(id);
    if (!job) {
      logger.warn(CTX, "updateJobStatus — not found", { id });
      throw new AppError("Job not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !STATUS_VALUES.includes(status))
      throw new AppError(
        `status must be one of: ${STATUS_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    await job.update({ status });

    logger.info(CTX, "updateJobStatus — updated", { id, status });

    return NextResponse.json(
      {
        success: true,
        message: "Job status updated.",
        data: { id: job.id, status: job.status },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "updateJobStatus — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────

export async function deleteJob(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteJob — start", { id });

  try {
    if (!id) throw new AppError("Job ID is required.", 400, "MISSING_ID");

    const job = await Job.findByPk(id);
    if (!job) {
      logger.warn(CTX, "deleteJob — not found", { id });
      throw new AppError("Job not found.", 404, "NOT_FOUND");
    }

    const { jobRole, department } = job;
    await job.destroy();

    logger.info(CTX, "deleteJob — deleted", { id });

    return NextResponse.json(
      {
        success: true,
        message: "Job deleted.",
        data: { id, jobRole, department },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteJob — failed", { id, error });
    return errorResponse(error);
  }
}

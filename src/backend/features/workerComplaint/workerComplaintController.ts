import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import WorkerComplaint, {
  type ComplaintCategory,
  type ComplaintSeverity,
  type ComplaintStatus,
} from "./workerComplaintModel";
import { Company } from "../companyCreation/companyModel";
import { Worker } from "../worker/workerModel";
import Onboarding from "../onBoarding/onBoardingModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "WorkerComplaintController";

const CATEGORY_VALUES: ComplaintCategory[] = [
  "attendance",
  "misconduct",
  "performance",
  "policy_violation",
  "damage",
  "other",
];

const SEVERITY_VALUES: ComplaintSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

const STATUS_VALUES: ComplaintStatus[] = [
  "open",
  "under_review",
  "resolved",
  "dismissed",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ─── GET /api/worker-complaints — list all ────────────────────────────────────

export async function getAllComplaints(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllComplaints — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search       = searchParams.get("search")?.trim();
    const companyId    = searchParams.get("companyId")?.trim();
    const workerId     = searchParams.get("workerId")?.trim();
    const onboardingId = searchParams.get("onboardingId")?.trim();
    const status       = searchParams.get("status")?.trim();
    const severity     = searchParams.get("severity")?.trim();
    const category     = searchParams.get("category")?.trim();

    const where: Record<string, unknown> = {};

    if (companyId)    where.companyId    = companyId;
    if (workerId)     where.workerId     = workerId;
    if (onboardingId) where.onboardingId = onboardingId;
    if (status)       where.status       = status;
    if (severity)     where.severity     = severity;
    if (category)     where.category     = category;

    if (search) {
      where[Op.or as unknown as string] = [
        { title:       { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { adminNote:   { [Op.iLike]: `%${search}%` } },
        { resolution:  { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await WorkerComplaint.findAndCountAll({
      where,
      include: [
        { model: Company, as: "company", attributes: ["id", "companyName", "companyCode", "industry"] },
        { model: Worker,  as: "worker",  attributes: ["id", "fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllComplaints — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllComplaints — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/worker-complaints/:id ───────────────────────────────────────────

export async function getComplaintById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getComplaintById — start", { id });

  try {
    if (!id) throw new AppError("Complaint ID is required.", 400, "MISSING_ID");

    const complaint = await WorkerComplaint.findByPk(id, {
      include: [
        { model: Company,    as: "company",    attributes: ["id", "companyName", "companyCode", "industry"] },
        { model: Worker,     as: "worker",     attributes: ["id", "fullName", "email"] },
        { model: Onboarding, as: "onboarding" },
      ],
    });

    if (!complaint) {
      logger.warn(CTX, "getComplaintById — not found", { id });
      throw new AppError("Complaint not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getComplaintById — found", { id });

    return NextResponse.json({ success: true, data: complaint }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getComplaintById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/worker-complaints ──────────────────────────────────────────────
// Body: { companyId, workerId, onboardingId, title, description,
//         category, severity }

export async function createComplaint(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createComplaint — start");

  try {
    const body = await req.json();
    const {
      companyId,
      workerId,
      onboardingId,
      title,
      description,
      category,
      severity,
    } = body;

    logger.debug(CTX, "createComplaint — payload", {
      companyId, workerId, onboardingId, category,
    });

    // ── Validation ──────────────────────────────────────────────────────
    if (!companyId?.trim())
      throw new AppError("companyId is required.", 400, "VALIDATION_ERROR");
    if (!workerId?.trim())
      throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");
    if (!onboardingId?.trim())
      throw new AppError("onboardingId is required.", 400, "VALIDATION_ERROR");
    if (!title?.trim())
      throw new AppError("title is required.", 400, "VALIDATION_ERROR");
    if (!description?.trim())
      throw new AppError("description is required.", 400, "VALIDATION_ERROR");

    if (!CATEGORY_VALUES.includes(category))
      throw new AppError(
        `category must be one of: ${CATEGORY_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    if (severity !== undefined && !SEVERITY_VALUES.includes(severity))
      throw new AppError(
        `severity must be one of: ${SEVERITY_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    // ── Verify related records exist ────────────────────────────────────
    const company = await Company.findByPk(companyId);
    if (!company)
      throw new AppError("Company not found.", 404, "COMPANY_NOT_FOUND");

    const worker = await Worker.findByPk(workerId);
    if (!worker)
      throw new AppError("Worker not found.", 404, "WORKER_NOT_FOUND");

    const onboarding = await Onboarding.findByPk(onboardingId);
    if (!onboarding)
      throw new AppError("Onboarding record not found.", 404, "ONBOARDING_NOT_FOUND");

    // ── Create ──────────────────────────────────────────────────────────
    const complaint = await WorkerComplaint.create({
      companyId,
      workerId,
      onboardingId,
      title:       title.trim(),
      description: description.trim(),
      category,
      severity:    severity ?? "medium",
      status:      "open",
    });

    logger.info(CTX, "createComplaint — created", { id: complaint.id });

    return NextResponse.json({ success: true, data: complaint }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createComplaint — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/worker-complaints/:id ─────────────────────────────────────────
// Body: { status?, adminNote?, resolution?, severity?, category?, title?, description? }
// Auto-sets resolvedAt when status becomes resolved / dismissed.

export async function updateComplaint(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateComplaint — start", { id });

  try {
    if (!id) throw new AppError("Complaint ID is required.", 400, "MISSING_ID");

    const complaint = await WorkerComplaint.findByPk(id);
    if (!complaint) {
      logger.warn(CTX, "updateComplaint — not found", { id });
      throw new AppError("Complaint not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      status,
      adminNote,
      resolution,
      severity,
      category,
      title,
      description,
    } = body;

    logger.debug(CTX, "updateComplaint — payload", { id, status });

    const updates: Partial<{
      status: ComplaintStatus;
      adminNote: string | null;
      resolution: string | null;
      resolvedAt: Date | null;
      severity: ComplaintSeverity;
      category: ComplaintCategory;
      title: string;
      description: string;
    }> = {};

    if (status !== undefined) {
      if (!STATUS_VALUES.includes(status))
        throw new AppError(
          `status must be one of: ${STATUS_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.status = status;

      // Auto-manage resolvedAt based on status transition
      if (status === "resolved" || status === "dismissed") {
        updates.resolvedAt = complaint.resolvedAt ?? new Date();
      } else {
        updates.resolvedAt = null;
      }
    }

    if (adminNote !== undefined)
      updates.adminNote = adminNote?.trim() || null;

    if (resolution !== undefined)
      updates.resolution = resolution?.trim() || null;

    if (severity !== undefined) {
      if (!SEVERITY_VALUES.includes(severity))
        throw new AppError(
          `severity must be one of: ${SEVERITY_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.severity = severity;
    }

    if (category !== undefined) {
      if (!CATEGORY_VALUES.includes(category))
        throw new AppError(
          `category must be one of: ${CATEGORY_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.category = category;
    }

    if (title !== undefined) {
      if (!title?.trim())
        throw new AppError("title cannot be empty.", 400, "VALIDATION_ERROR");
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (!description?.trim())
        throw new AppError("description cannot be empty.", 400, "VALIDATION_ERROR");
      updates.description = description.trim();
    }

    await complaint.update(updates);

    logger.info(CTX, "updateComplaint — updated", { id, status: complaint.status });

    return NextResponse.json({ success: true, data: complaint }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateComplaint — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/worker-complaints/:id ────────────────────────────────────────

export async function deleteComplaint(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteComplaint — start", { id });

  try {
    if (!id) throw new AppError("Complaint ID is required.", 400, "MISSING_ID");

    const complaint = await WorkerComplaint.findByPk(id);
    if (!complaint) {
      logger.warn(CTX, "deleteComplaint — not found", { id });
      throw new AppError("Complaint not found.", 404, "NOT_FOUND");
    }

    const { companyId, workerId } = complaint;
    await complaint.destroy();

    logger.info(CTX, "deleteComplaint — deleted", { id, companyId });

    return NextResponse.json({
      success: true,
      message: "Complaint deleted.",
      data: { id, companyId, workerId },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteComplaint — failed", { id, error });
    return errorResponse(error);
  }
}
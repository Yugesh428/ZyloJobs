import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import CompanyComplaint, {
  type CompanyComplaintCategory,
  type CompanyComplaintSeverity,
  type CompanyComplaintStatus,
} from "./companyComplaintModel";
import { Worker } from "../worker/workerModel";
import { Company } from "../companyCreation/companyModel";
import Onboarding from "../onBoarding/onBoardingModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "CompanyComplaintController";

const CATEGORY_VALUES: CompanyComplaintCategory[] = [
  "harassment",
  "unsafe_conditions",
  "overwork",
  "discrimination",
  "contract_violation",
  "other",
];

const SEVERITY_VALUES: CompanyComplaintSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

const STATUS_VALUES: CompanyComplaintStatus[] = [
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

/**
 * For anonymous complaints, hide the worker identity when the
 * requester is NOT an admin (e.g. company-facing view).
 * Admins pass ?asAdmin=true to see the real filer.
 */
function sanitizeForViewer(row: CompanyComplaint, isAdmin: boolean) {
  const plain = row.toJSON() as unknown as Record<string, unknown>;
  if (!isAdmin && plain.isAnonymous) {
    plain.workerId = null;
    plain.worker   = null;
  }
  return plain;
}

// ─── GET /api/company-complaints — list all ───────────────────────────────────

export async function getAllCompanyComplaints(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllCompanyComplaints — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search       = searchParams.get("search")?.trim();
    const workerId     = searchParams.get("workerId")?.trim();
    const companyId    = searchParams.get("companyId")?.trim();
    const onboardingId = searchParams.get("onboardingId")?.trim();
    const status       = searchParams.get("status")?.trim();
    const severity     = searchParams.get("severity")?.trim();
    const category     = searchParams.get("category")?.trim();
    const isAnonymous  = searchParams.get("isAnonymous");

    // Admin sees everything. Non-admin views hide anonymous worker identity.
    const isAdmin = searchParams.get("asAdmin") === "true";

    const where: Record<string, unknown> = {};

    if (workerId)     where.workerId     = workerId;
    if (companyId)    where.companyId    = companyId;
    if (onboardingId) where.onboardingId = onboardingId;
    if (status)       where.status       = status;
    if (severity)     where.severity     = severity;
    if (category)     where.category     = category;
    if (isAnonymous !== null && isAnonymous !== "") {
      where.isAnonymous = isAnonymous === "true";
    }

    if (search) {
      where[Op.or as unknown as string] = [
        { title:       { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { adminNote:   { [Op.iLike]: `%${search}%` } },
        { resolution:  { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await CompanyComplaint.findAndCountAll({
      where,
      include: [
        { model: Worker,  as: "worker",  attributes: ["id", "fullName", "email"] },
        { model: Company, as: "company", attributes: ["id", "companyName", "companyCode", "industry"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const data = rows.map((row) => sanitizeForViewer(row, isAdmin));

    logger.info(CTX, `getAllCompanyComplaints — ${rows.length} of ${count}`);

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
      data,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAllCompanyComplaints — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/company-complaints/:id ──────────────────────────────────────────

export async function getCompanyComplaintById(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getCompanyComplaintById — start", { id });

  try {
    if (!id) throw new AppError("Complaint ID is required.", 400, "MISSING_ID");

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("asAdmin") === "true";

    const complaint = await CompanyComplaint.findByPk(id, {
      include: [
        { model: Worker,     as: "worker",     attributes: ["id", "fullName", "email"] },
        { model: Company,    as: "company",    attributes: ["id", "companyName", "companyCode", "industry"] },
        { model: Onboarding, as: "onboarding" },
      ],
    });

    if (!complaint) {
      logger.warn(CTX, "getCompanyComplaintById — not found", { id });
      throw new AppError("Complaint not found.", 404, "NOT_FOUND");
    }

    const data = sanitizeForViewer(complaint, isAdmin);

    logger.info(CTX, "getCompanyComplaintById — found", { id });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getCompanyComplaintById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/company-complaints ─────────────────────────────────────────────
// Body: { workerId, companyId, onboardingId, title, description,
//         category, severity, isAnonymous? }

export async function createCompanyComplaint(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createCompanyComplaint — start");

  try {
    const body = await req.json();
    const {
      workerId,
      companyId,
      onboardingId,
      title,
      description,
      category,
      severity,
      isAnonymous,
    } = body;

    logger.debug(CTX, "createCompanyComplaint — payload", {
      workerId, companyId, onboardingId, category,
    });

    // ── Validation ──────────────────────────────────────────────────────
    if (!workerId?.trim())
      throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");
    if (!companyId?.trim())
      throw new AppError("companyId is required.", 400, "VALIDATION_ERROR");
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
    const worker = await Worker.findByPk(workerId);
    if (!worker)
      throw new AppError("Worker not found.", 404, "WORKER_NOT_FOUND");

    const company = await Company.findByPk(companyId);
    if (!company)
      throw new AppError("Company not found.", 404, "COMPANY_NOT_FOUND");

    const onboarding = await Onboarding.findByPk(onboardingId);
    if (!onboarding)
      throw new AppError("Onboarding record not found.", 404, "ONBOARDING_NOT_FOUND");

    // ── Create ──────────────────────────────────────────────────────────
    const complaint = await CompanyComplaint.create({
      workerId,
      companyId,
      onboardingId,
      title:       title.trim(),
      description: description.trim(),
      category,
      severity:    severity ?? "medium",
      isAnonymous: isAnonymous === true,
      status:      "open",
    });

    logger.info(CTX, "createCompanyComplaint — created", {
      id: complaint.id, isAnonymous: complaint.isAnonymous,
    });

    // Hide worker identity in the response if the complaint is anonymous
    const data = sanitizeForViewer(complaint, false);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createCompanyComplaint — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/company-complaints/:id ────────────────────────────────────────
// Body: { status?, adminNote?, resolution?, severity?, category?,
//         title?, description?, isAnonymous? }
// Auto-sets resolvedAt when status becomes resolved / dismissed.

export async function updateCompanyComplaint(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateCompanyComplaint — start", { id });

  try {
    if (!id) throw new AppError("Complaint ID is required.", 400, "MISSING_ID");

    const complaint = await CompanyComplaint.findByPk(id);
    if (!complaint) {
      logger.warn(CTX, "updateCompanyComplaint — not found", { id });
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
      isAnonymous,
    } = body;

    logger.debug(CTX, "updateCompanyComplaint — payload", { id, status });

    const updates: Partial<{
      status: CompanyComplaintStatus;
      adminNote: string | null;
      resolution: string | null;
      resolvedAt: Date | null;
      severity: CompanyComplaintSeverity;
      category: CompanyComplaintCategory;
      title: string;
      description: string;
      isAnonymous: boolean;
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

    if (isAnonymous !== undefined) {
      updates.isAnonymous = !!isAnonymous;
    }

    await complaint.update(updates);

    logger.info(CTX, "updateCompanyComplaint — updated", {
      id, status: complaint.status,
    });

    return NextResponse.json({ success: true, data: complaint }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateCompanyComplaint — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/company-complaints/:id ───────────────────────────────────────

export async function deleteCompanyComplaint(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteCompanyComplaint — start", { id });

  try {
    if (!id) throw new AppError("Complaint ID is required.", 400, "MISSING_ID");

    const complaint = await CompanyComplaint.findByPk(id);
    if (!complaint) {
      logger.warn(CTX, "deleteCompanyComplaint — not found", { id });
      throw new AppError("Complaint not found.", 404, "NOT_FOUND");
    }

    const { workerId, companyId } = complaint;
    await complaint.destroy();

    logger.info(CTX, "deleteCompanyComplaint — deleted", { id, companyId });

    return NextResponse.json({
      success: true,
      message: "Complaint deleted.",
      data: { id, workerId, companyId },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteCompanyComplaint — failed", { id, error });
    return errorResponse(error);
  }
}
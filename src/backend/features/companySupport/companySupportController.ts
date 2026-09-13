import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import CompanySupportTicket, {
  type CompanySupportTicketCategory,
  type CompanySupportTicketPriority,
  type CompanySupportTicketStatus,
} from "./companySupportModel";
import { Company } from "../companyCreation/companyModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "CompanySupportTicketController";

const CATEGORY_VALUES: CompanySupportTicketCategory[] = [
  "billing",
  "worker_quality",
  "staffing",
  "onboarding",
  "platform",
  "account",
  "other",
];

const PRIORITY_VALUES: CompanySupportTicketPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const STATUS_VALUES: CompanySupportTicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ─── GET /api/company-support-tickets — list all ──────────────────────────────

export async function getAllCompanySupportTickets(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllCompanySupportTickets — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search     = searchParams.get("search")?.trim();
    const companyId  = searchParams.get("companyId")?.trim();
    const status     = searchParams.get("status")?.trim();
    const priority   = searchParams.get("priority")?.trim();
    const category   = searchParams.get("category")?.trim();
    const assignedTo = searchParams.get("assignedTo")?.trim();

    const where: Record<string, unknown> = {};

    if (companyId)  where.companyId  = companyId;
    if (status)     where.status     = status;
    if (priority)   where.priority   = priority;
    if (category)   where.category   = category;
    if (assignedTo) where.assignedTo = assignedTo;

    if (search) {
      where[Op.or as unknown as string] = [
        { subject:    { [Op.iLike]: `%${search}%` } },
        { message:    { [Op.iLike]: `%${search}%` } },
        { adminReply: { [Op.iLike]: `%${search}%` } },
        { assignedTo: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await CompanySupportTicket.findAndCountAll({
      where,
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "companyName", "companyCode", "industry"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllCompanySupportTickets — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllCompanySupportTickets — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/company-support-tickets/:id ─────────────────────────────────────

export async function getCompanySupportTicketById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getCompanySupportTicketById — start", { id });

  try {
    if (!id) throw new AppError("Ticket ID is required.", 400, "MISSING_ID");

    const ticket = await CompanySupportTicket.findByPk(id, {
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "companyName", "companyCode", "industry"],
        },
      ],
    });

    if (!ticket) {
      logger.warn(CTX, "getCompanySupportTicketById — not found", { id });
      throw new AppError("Support ticket not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getCompanySupportTicketById — found", { id });

    return NextResponse.json({ success: true, data: ticket }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getCompanySupportTicketById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── GET /api/company-support-tickets/company/:companyId ──────────────────────

export async function getCompanySupportTicketsByCompany(
  req: NextRequest,
  companyId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getCompanySupportTicketsByCompany — start", { companyId });

  try {
    if (!companyId)
      throw new AppError("companyId is required.", 400, "MISSING_ID");

    const company = await Company.findByPk(companyId, {
      attributes: ["id", "companyName", "companyCode", "industry"],
    });
    if (!company)
      throw new AppError("Company not found.", 404, "COMPANY_NOT_FOUND");

    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = { companyId };
    if (status) where.status = status;

    const { count, rows } = await CompanySupportTicket.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getCompanySupportTicketsByCompany — ${rows.length} of ${count}`, { companyId });

    return NextResponse.json({
      success: true,
      company,
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
    logger.error(CTX, "getCompanySupportTicketsByCompany — failed", { companyId, error });
    return errorResponse(error);
  }
}

// ─── POST /api/company-support-tickets ────────────────────────────────────────
// Body: { companyId, subject, message, category, priority? }

export async function createCompanySupportTicket(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createCompanySupportTicket — start");

  try {
    const body = await req.json();
    const {
      companyId,
      subject,
      message,
      category,
      priority,
    } = body;

    logger.debug(CTX, "createCompanySupportTicket — payload", { companyId, category });

    // ── Validation ──────────────────────────────────────────────────────
    if (!companyId?.trim())
      throw new AppError("companyId is required.", 400, "VALIDATION_ERROR");
    if (!subject?.trim())
      throw new AppError("subject is required.", 400, "VALIDATION_ERROR");
    if (!message?.trim())
      throw new AppError("message is required.", 400, "VALIDATION_ERROR");

    if (!CATEGORY_VALUES.includes(category))
      throw new AppError(
        `category must be one of: ${CATEGORY_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    if (priority !== undefined && !PRIORITY_VALUES.includes(priority))
      throw new AppError(
        `priority must be one of: ${PRIORITY_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    // ── Verify company exists ───────────────────────────────────────────
    const company = await Company.findByPk(companyId);
    if (!company)
      throw new AppError("Company not found.", 404, "COMPANY_NOT_FOUND");

    // ── Create ──────────────────────────────────────────────────────────
    const ticket = await CompanySupportTicket.create({
      companyId,
      subject:  subject.trim(),
      message:  message.trim(),
      category,
      priority: priority ?? "medium",
      status:   "open",
    });

    logger.info(CTX, "createCompanySupportTicket — created", { id: ticket.id });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createCompanySupportTicket — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/company-support-tickets/:id ───────────────────────────────────
// Body: { status?, assignedTo?, adminReply?, priority?, category?,
//         subject?, message? }
// Auto-sets resolvedAt when status becomes resolved / closed.

export async function updateCompanySupportTicket(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateCompanySupportTicket — start", { id });

  try {
    if (!id) throw new AppError("Ticket ID is required.", 400, "MISSING_ID");

    const ticket = await CompanySupportTicket.findByPk(id);
    if (!ticket) {
      logger.warn(CTX, "updateCompanySupportTicket — not found", { id });
      throw new AppError("Support ticket not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      status,
      assignedTo,
      adminReply,
      priority,
      category,
      subject,
      message,
    } = body;

    logger.debug(CTX, "updateCompanySupportTicket — payload", { id, status });

    const updates: Partial<{
      status: CompanySupportTicketStatus;
      assignedTo: string | null;
      adminReply: string | null;
      resolvedAt: Date | null;
      priority: CompanySupportTicketPriority;
      category: CompanySupportTicketCategory;
      subject: string;
      message: string;
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
      if (status === "resolved" || status === "closed") {
        updates.resolvedAt = ticket.resolvedAt ?? new Date();
      } else {
        updates.resolvedAt = null;
      }
    }

    if (assignedTo !== undefined)
      updates.assignedTo = assignedTo?.trim() || null;

    if (adminReply !== undefined)
      updates.adminReply = adminReply?.trim() || null;

    if (priority !== undefined) {
      if (!PRIORITY_VALUES.includes(priority))
        throw new AppError(
          `priority must be one of: ${PRIORITY_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.priority = priority;
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

    if (subject !== undefined) {
      if (!subject?.trim())
        throw new AppError("subject cannot be empty.", 400, "VALIDATION_ERROR");
      updates.subject = subject.trim();
    }

    if (message !== undefined) {
      if (!message?.trim())
        throw new AppError("message cannot be empty.", 400, "VALIDATION_ERROR");
      updates.message = message.trim();
    }

    await ticket.update(updates);

    logger.info(CTX, "updateCompanySupportTicket — updated", { id, status: ticket.status });

    return NextResponse.json({ success: true, data: ticket }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateCompanySupportTicket — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/company-support-tickets/:id ──────────────────────────────────

export async function deleteCompanySupportTicket(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteCompanySupportTicket — start", { id });

  try {
    if (!id) throw new AppError("Ticket ID is required.", 400, "MISSING_ID");

    const ticket = await CompanySupportTicket.findByPk(id);
    if (!ticket) {
      logger.warn(CTX, "deleteCompanySupportTicket — not found", { id });
      throw new AppError("Support ticket not found.", 404, "NOT_FOUND");
    }

    const { companyId, subject } = ticket;
    await ticket.destroy();

    logger.info(CTX, "deleteCompanySupportTicket — deleted", { id, companyId });

    return NextResponse.json({
      success: true,
      message: "Support ticket deleted.",
      data: { id, companyId, subject },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteCompanySupportTicket — failed", { id, error });
    return errorResponse(error);
  }
}
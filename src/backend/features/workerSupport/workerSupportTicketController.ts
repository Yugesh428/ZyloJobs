import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import SupportTicket, {
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "./workerSupportTicketModel";
import { Worker } from "../worker/workerModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "SupportTicketController";

const CATEGORY_VALUES: SupportTicketCategory[] = [
  "account",
  "job",
  "onboarding",
  "attendance",
  "payment",
  "technical",
  "other",
];

const PRIORITY_VALUES: SupportTicketPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const STATUS_VALUES: SupportTicketStatus[] = [
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

// ─── GET /api/support-tickets — list all ──────────────────────────────────────

export async function getAllSupportTickets(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllSupportTickets — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search     = searchParams.get("search")?.trim();
    const workerId   = searchParams.get("workerId")?.trim();
    const status     = searchParams.get("status")?.trim();
    const priority   = searchParams.get("priority")?.trim();
    const category   = searchParams.get("category")?.trim();
    const assignedTo = searchParams.get("assignedTo")?.trim();

    const where: Record<string, unknown> = {};

    if (workerId)   where.workerId   = workerId;
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

    const { count, rows } = await SupportTicket.findAndCountAll({
      where,
      include: [
        { model: Worker, as: "worker", attributes: ["id", "fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllSupportTickets — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllSupportTickets — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/support-tickets/:id ─────────────────────────────────────────────

export async function getSupportTicketById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getSupportTicketById — start", { id });

  try {
    if (!id) throw new AppError("Ticket ID is required.", 400, "MISSING_ID");

    const ticket = await SupportTicket.findByPk(id, {
      include: [
        { model: Worker, as: "worker", attributes: ["id", "fullName", "email"] },
      ],
    });

    if (!ticket) {
      logger.warn(CTX, "getSupportTicketById — not found", { id });
      throw new AppError("Support ticket not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getSupportTicketById — found", { id });

    return NextResponse.json({ success: true, data: ticket }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getSupportTicketById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── GET /api/support-tickets/worker/:workerId ────────────────────────────────

export async function getSupportTicketsByWorker(
  req: NextRequest,
  workerId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getSupportTicketsByWorker — start", { workerId });

  try {
    if (!workerId)
      throw new AppError("workerId is required.", 400, "MISSING_ID");

    const worker = await Worker.findByPk(workerId, {
      attributes: ["id", "fullName", "email"],
    });
    if (!worker)
      throw new AppError("Worker not found.", 404, "WORKER_NOT_FOUND");

    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = { workerId };
    if (status) where.status = status;

    const { count, rows } = await SupportTicket.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getSupportTicketsByWorker — ${rows.length} of ${count}`, { workerId });

    return NextResponse.json({
      success: true,
      worker,
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
    logger.error(CTX, "getSupportTicketsByWorker — failed", { workerId, error });
    return errorResponse(error);
  }
}

// ─── POST /api/support-tickets ────────────────────────────────────────────────
// Body: { workerId, subject, message, category, priority? }

export async function createSupportTicket(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createSupportTicket — start");

  try {
    const body = await req.json();
    const {
      workerId,
      subject,
      message,
      category,
      priority,
    } = body;

    logger.debug(CTX, "createSupportTicket — payload", { workerId, category });

    // ── Validation ──────────────────────────────────────────────────────
    if (!workerId?.trim())
      throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");
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

    // ── Verify worker exists ────────────────────────────────────────────
    const worker = await Worker.findByPk(workerId);
    if (!worker)
      throw new AppError("Worker not found.", 404, "WORKER_NOT_FOUND");

    // ── Create ──────────────────────────────────────────────────────────
    const ticket = await SupportTicket.create({
      workerId,
      subject:  subject.trim(),
      message:  message.trim(),
      category,
      priority: priority ?? "medium",
      status:   "open",
    });

    logger.info(CTX, "createSupportTicket — created", { id: ticket.id });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createSupportTicket — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/support-tickets/:id ───────────────────────────────────────────
// Body: { status?, assignedTo?, adminReply?, priority?, category?,
//         subject?, message? }
// Auto-sets resolvedAt when status becomes resolved / closed.

export async function updateSupportTicket(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateSupportTicket — start", { id });

  try {
    if (!id) throw new AppError("Ticket ID is required.", 400, "MISSING_ID");

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      logger.warn(CTX, "updateSupportTicket — not found", { id });
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

    logger.debug(CTX, "updateSupportTicket — payload", { id, status });

    const updates: Partial<{
      status: SupportTicketStatus;
      assignedTo: string | null;
      adminReply: string | null;
      resolvedAt: Date | null;
      priority: SupportTicketPriority;
      category: SupportTicketCategory;
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

    logger.info(CTX, "updateSupportTicket — updated", { id, status: ticket.status });

    return NextResponse.json({ success: true, data: ticket }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateSupportTicket — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/support-tickets/:id ──────────────────────────────────────────

export async function deleteSupportTicket(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteSupportTicket — start", { id });

  try {
    if (!id) throw new AppError("Ticket ID is required.", 400, "MISSING_ID");

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      logger.warn(CTX, "deleteSupportTicket — not found", { id });
      throw new AppError("Support ticket not found.", 404, "NOT_FOUND");
    }

    const { workerId, subject } = ticket;
    await ticket.destroy();

    logger.info(CTX, "deleteSupportTicket — deleted", { id, workerId });

    return NextResponse.json({
      success: true,
      message: "Support ticket deleted.",
      data: { id, workerId, subject },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteSupportTicket — failed", { id, error });
    return errorResponse(error);
  }
}
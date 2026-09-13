import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Announcement, {
  type AnnouncementType,
  type AnnouncementAudience,
} from "./announcementModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "AnnouncementController";

const TYPE_VALUES: AnnouncementType[] = ["info", "warning", "alert", "update"];

const AUDIENCE_VALUES: AnnouncementAudience[] = ["all", "workers", "companies"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toBool(val: unknown): boolean | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
}

// ─── GET /api/announcements — list all ────────────────────────────────────────
// Supports ?audience=workers&activeOnly=true for public/worker/company fetches.

export async function getAllAnnouncements(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllAnnouncements — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search      = searchParams.get("search")?.trim();
    const type        = searchParams.get("type")?.trim();
    const audience    = searchParams.get("audience")?.trim();
    const createdBy   = searchParams.get("createdBy")?.trim();
    const isPublished = toBool(searchParams.get("isPublished"));
    const activeOnly  = toBool(searchParams.get("activeOnly")) === true;

    const where: Record<string, unknown> = {};

    if (type)      where.type      = type;
    if (createdBy) where.createdBy = createdBy;

    // Audience filter:
    // - explicit ?audience=X returns X + "all" (since "all" is visible to everyone)
    // - otherwise no audience constraint
    if (audience) {
      where.audience = {
        [Op.or as unknown as string]: [audience, "all"],
      };
    }

    // activeOnly overrides isPublished and adds expiry check
    if (activeOnly) {
      where.isPublished = true;
      where[Op.or as unknown as string] = [
        { expiresAt: null },
        { expiresAt: { [Op.gte]: new Date() } },
      ];
    } else if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (search) {
      where[Op.or as unknown as string] = [
        { title:     { [Op.iLike]: `%${search}%` } },
        { body:      { [Op.iLike]: `%${search}%` } },
        { createdBy: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      order: [
        ["isPublished", "DESC"],
        ["publishedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllAnnouncements — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllAnnouncements — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/announcements/:id ───────────────────────────────────────────────

export async function getAnnouncementById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getAnnouncementById — start", { id });

  try {
    if (!id) throw new AppError("Announcement ID is required.", 400, "MISSING_ID");

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      logger.warn(CTX, "getAnnouncementById — not found", { id });
      throw new AppError("Announcement not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getAnnouncementById — found", { id });

    return NextResponse.json({ success: true, data: announcement }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAnnouncementById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/announcements ──────────────────────────────────────────────────
// Body: { title, body, type, audience, createdBy, expiresAt?, isPublished? }

export async function createAnnouncement(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createAnnouncement — start");

  try {
    const body = await req.json();
    const {
      title,
      body: content,
      type,
      audience,
      createdBy,
      expiresAt,
      isPublished,
    } = body;

    logger.debug(CTX, "createAnnouncement — payload", { title, type, audience });

    // ── Validation ──────────────────────────────────────────────────────
    if (!title?.trim())
      throw new AppError("title is required.", 400, "VALIDATION_ERROR");
    if (!content?.trim())
      throw new AppError("body is required.", 400, "VALIDATION_ERROR");
    if (!createdBy?.trim())
      throw new AppError("createdBy is required.", 400, "VALIDATION_ERROR");

    if (!TYPE_VALUES.includes(type))
      throw new AppError(
        `type must be one of: ${TYPE_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    if (!AUDIENCE_VALUES.includes(audience))
      throw new AppError(
        `audience must be one of: ${AUDIENCE_VALUES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );

    let expires: string | null = null;
    if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
      if (!ISO_DATE_RE.test(expiresAt))
        throw new AppError(
          "expiresAt must be in YYYY-MM-DD format.",
          400,
          "VALIDATION_ERROR",
        );
      expires = expiresAt;
    }

    const willPublish = isPublished === true;

    // ── Create ──────────────────────────────────────────────────────────
    const announcement = await Announcement.create({
      title:       title.trim(),
      body:        content.trim(),
      type,
      audience,
      createdBy:   createdBy.trim(),
      expiresAt:   expires,
      isPublished: willPublish,
      publishedAt: willPublish ? new Date() : null,
    });

    logger.info(CTX, "createAnnouncement — created", {
      id: announcement.id, isPublished: announcement.isPublished,
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createAnnouncement — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/announcements/:id ─────────────────────────────────────────────
// Body: { title?, body?, type?, audience?, createdBy?, expiresAt?, isPublished? }
// Auto-sets publishedAt when isPublished flips to true.

export async function updateAnnouncement(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateAnnouncement — start", { id });

  try {
    if (!id) throw new AppError("Announcement ID is required.", 400, "MISSING_ID");

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      logger.warn(CTX, "updateAnnouncement — not found", { id });
      throw new AppError("Announcement not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      title,
      body: content,
      type,
      audience,
      createdBy,
      expiresAt,
      isPublished,
    } = body;

    logger.debug(CTX, "updateAnnouncement — payload", { id, isPublished });

    const updates: Partial<{
      title: string;
      body: string;
      type: AnnouncementType;
      audience: AnnouncementAudience;
      createdBy: string;
      expiresAt: string | null;
      isPublished: boolean;
      publishedAt: Date | null;
    }> = {};

    if (title !== undefined) {
      if (!title?.trim())
        throw new AppError("title cannot be empty.", 400, "VALIDATION_ERROR");
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (!content?.trim())
        throw new AppError("body cannot be empty.", 400, "VALIDATION_ERROR");
      updates.body = content.trim();
    }

    if (type !== undefined) {
      if (!TYPE_VALUES.includes(type))
        throw new AppError(
          `type must be one of: ${TYPE_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.type = type;
    }

    if (audience !== undefined) {
      if (!AUDIENCE_VALUES.includes(audience))
        throw new AppError(
          `audience must be one of: ${AUDIENCE_VALUES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.audience = audience;
    }

    if (createdBy !== undefined) {
      if (!createdBy?.trim())
        throw new AppError("createdBy cannot be empty.", 400, "VALIDATION_ERROR");
      updates.createdBy = createdBy.trim();
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === "") {
        updates.expiresAt = null;
      } else {
        if (!ISO_DATE_RE.test(expiresAt))
          throw new AppError(
            "expiresAt must be in YYYY-MM-DD format.",
            400,
            "VALIDATION_ERROR",
          );
        updates.expiresAt = expiresAt;
      }
    }

    if (isPublished !== undefined) {
      updates.isPublished = !!isPublished;

      // Auto-manage publishedAt on transition
      if (isPublished === true && !announcement.isPublished) {
        updates.publishedAt = new Date();
      } else if (isPublished === false) {
        updates.publishedAt = null;
      }
    }

    await announcement.update(updates);

    logger.info(CTX, "updateAnnouncement — updated", {
      id, isPublished: announcement.isPublished,
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateAnnouncement — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/announcements/:id ────────────────────────────────────────────

export async function deleteAnnouncement(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteAnnouncement — start", { id });

  try {
    if (!id) throw new AppError("Announcement ID is required.", 400, "MISSING_ID");

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      logger.warn(CTX, "deleteAnnouncement — not found", { id });
      throw new AppError("Announcement not found.", 404, "NOT_FOUND");
    }

    const { title, type, audience } = announcement;
    await announcement.destroy();

    logger.info(CTX, "deleteAnnouncement — deleted", { id });

    return NextResponse.json({
      success: true,
      message: "Announcement deleted.",
      data: { id, title, type, audience },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteAnnouncement — failed", { id, error });
    return errorResponse(error);
  }
}
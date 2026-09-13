import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import JobCategory from "./jobCategoryCreationModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "JobCategoryController";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePagination(sp: URLSearchParams) {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function toBool(val: unknown): boolean | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
}

// ─── GET /api/job-categories — list all ───────────────────────────────────────

export async function getAllJobCategories(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "getAllJobCategories — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get("search")?.trim();
    const isActive = toBool(searchParams.get("isActive"));

    const where: Record<string, unknown> = {};

    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await JobCategory.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllJobCategories — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllJobCategories — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/job-categories/:id ──────────────────────────────────────────────

export async function getJobCategoryById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getJobCategoryById — start", { id });

  try {
    if (!id)
      throw new AppError("Job category ID is required.", 400, "MISSING_ID");

    const category = await JobCategory.findByPk(id);
    if (!category) {
      logger.warn(CTX, "getJobCategoryById — not found", { id });
      throw new AppError("Job category not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getJobCategoryById — found", { id });

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getJobCategoryById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── GET /api/job-categories/code/:code ───────────────────────────────────────

export async function getJobCategoryByCode(
  _req: NextRequest,
  code: string,
): Promise<NextResponse> {
  logger.info(CTX, "getJobCategoryByCode — start", { code });

  try {
    if (!code) throw new AppError("code is required.", 400, "MISSING_PARAM");

    const category = await JobCategory.findOne({ where: { code } });
    if (!category) {
      logger.warn(CTX, "getJobCategoryByCode — not found", { code });
      throw new AppError("Job category not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getJobCategoryByCode — found", { code });

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getJobCategoryByCode — failed", { code, error });
    return errorResponse(error);
  }
}

// ─── POST /api/job-categories ─────────────────────────────────────────────────
// Body: { name, code, description?, isActive? }

export async function createJobCategory(
  req: NextRequest,
): Promise<NextResponse> {
  logger.info(CTX, "createJobCategory — start");

  try {
    const body = await req.json();
    const { name, code, description, isActive } = body;

    logger.debug(CTX, "createJobCategory — payload", { name, code });

    // ── Validation ──────────────────────────────────────────────────────
    if (!name?.trim())
      throw new AppError("name is required.", 400, "VALIDATION_ERROR");
    if (!code?.trim())
      throw new AppError("code is required.", 400, "VALIDATION_ERROR");

    // ── Unique checks ───────────────────────────────────────────────────
    const existingName = await JobCategory.findOne({
      where: { name: name.trim() },
    });
    if (existingName) {
      throw new AppError("Job category name already exists.", 409, "DUPLICATE");
    }

    const existingCode = await JobCategory.findOne({
      where: { code: code.trim() },
    });
    if (existingCode) {
      throw new AppError("Job category code already exists.", 409, "DUPLICATE");
    }

    // ── Create ──────────────────────────────────────────────────────────
    const category = await JobCategory.create({
      name: name.trim(),
      code: code.trim(),
      description: description?.trim() || null,
      isActive: isActive ?? true,
    });

    logger.info(CTX, "createJobCategory — created", {
      id: category.id,
      code: category.code,
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (error) {
    logger.error(CTX, "createJobCategory — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/job-categories/:id ──────────────────────────────────────────────

export async function updateJobCategory(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateJobCategory — start", { id });

  try {
    if (!id)
      throw new AppError("Job category ID is required.", 400, "MISSING_ID");

    const category = await JobCategory.findByPk(id);
    if (!category) {
      logger.warn(CTX, "updateJobCategory — not found", { id });
      throw new AppError("Job category not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const { name, code, description, isActive } = body;

    logger.debug(CTX, "updateJobCategory — payload", { id });

    const updates: Partial<{
      name: string;
      code: string;
      description: string | null;
      isActive: boolean;
    }> = {};

    if (name !== undefined) {
      if (!name?.trim())
        throw new AppError("name cannot be empty.", 400, "VALIDATION_ERROR");

      const trimmed = name.trim();
      if (trimmed !== category.name) {
        const dup = await JobCategory.findOne({ where: { name: trimmed } });
        if (dup)
          throw new AppError(
            "Job category name already exists.",
            409,
            "DUPLICATE",
          );
      }
      updates.name = trimmed;
    }

    if (code !== undefined) {
      if (!code?.trim())
        throw new AppError("code cannot be empty.", 400, "VALIDATION_ERROR");

      const trimmed = code.trim();
      if (trimmed !== category.code) {
        const dup = await JobCategory.findOne({ where: { code: trimmed } });
        if (dup)
          throw new AppError(
            "Job category code already exists.",
            409,
            "DUPLICATE",
          );
      }
      updates.code = trimmed;
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      updates.isActive = !!isActive;
    }

    await category.update(updates);

    logger.info(CTX, "updateJobCategory — updated", { id });

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "updateJobCategory — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/job-categories/:id ───────────────────────────────────────────

export async function deleteJobCategory(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteJobCategory — start", { id });

  try {
    if (!id)
      throw new AppError("Job category ID is required.", 400, "MISSING_ID");

    const category = await JobCategory.findByPk(id);
    if (!category) {
      logger.warn(CTX, "deleteJobCategory — not found", { id });
      throw new AppError("Job category not found.", 404, "NOT_FOUND");
    }

    const { name, code } = category;
    await category.destroy();

    logger.info(CTX, "deleteJobCategory — deleted", { id, code });

    return NextResponse.json(
      {
        success: true,
        message: "Job category deleted.",
        data: { id, name, code },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteJobCategory — failed", { id, error });
    return errorResponse(error);
  }
}

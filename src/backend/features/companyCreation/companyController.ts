import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { Company, type CompanyType, type CompanyStatus } from "./companyModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";
import { syncDB } from "@/lib/sync";
import { sendCompanyCredentials } from "@/lib/email";

const CTX = "CompanyController";

const COMPANY_TYPE_VALUES: CompanyType[] = [
  "Private", "Public", "NGO", "Government", "Other",
];
const COMPANY_STATUS_VALUES: CompanyStatus[] = [
  "pending", "active", "suspended",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Fields to return — password excluded everywhere */
const SAFE_ATTRIBUTES: (keyof import("./companyModel").CompanyAttributes)[] = [
  "id", "companyName", "companyCode", "companyType",
  "industry", "email", "status",
  "registrationNumber", "panNumber",
  "companyDescription", "companyLogo",
  "createdAt", "updatedAt",
];

/* ------------------------------------------------------------------ */
/* GET /api/companies                                                  */
/* ------------------------------------------------------------------ */

export async function getAllCompanies(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllCompanies — start");
  await syncDB();

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search      = searchParams.get("search")?.trim();
    const companyType = searchParams.get("companyType")?.trim();
    const industry    = searchParams.get("industry")?.trim();
    const status      = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = {};
    if (companyType) where.companyType = companyType;
    if (industry)    where.industry    = industry;
    if (status)      where.status      = status;

    if (search) {
      where[Op.or as unknown as string] = [
        { companyName:        { [Op.iLike]: `%${search}%` } },
        { companyCode:        { [Op.iLike]: `%${search}%` } },
        { industry:           { [Op.iLike]: `%${search}%` } },
        { email:              { [Op.iLike]: `%${search}%` } },
        { registrationNumber: { [Op.iLike]: `%${search}%` } },
        { panNumber:          { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Company.findAndCountAll({
      attributes: SAFE_ATTRIBUTES,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllCompanies — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllCompanies — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/companies/:id                                              */
/* ------------------------------------------------------------------ */

export async function getCompanyById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getCompanyById — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Company ID is required.", 400, "MISSING_ID");

    const company = await Company.findByPk(id, { attributes: SAFE_ATTRIBUTES });
    if (!company) {
      logger.warn(CTX, "getCompanyById — not found", { id });
      throw new AppError("Company not found.", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: company }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getCompanyById — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/companies/code/:companyCode                                */
/* ------------------------------------------------------------------ */

export async function getCompanyByCode(
  _req: NextRequest,
  companyCode: string,
): Promise<NextResponse> {
  logger.info(CTX, "getCompanyByCode — start", { companyCode });
  await syncDB();

  try {
    if (!companyCode)
      throw new AppError("companyCode is required.", 400, "MISSING_PARAM");

    const company = await Company.findOne({
      where: { companyCode },
      attributes: SAFE_ATTRIBUTES,
    });
    if (!company) {
      logger.warn(CTX, "getCompanyByCode — not found", { companyCode });
      throw new AppError("Company not found.", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: company }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getCompanyByCode — failed", { companyCode, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/companies/register  (demo request from frontend)         */
/*                                                                     */
/* Body: { companyName, companyCode, email, password,                 */
/*         industry, companyType?, registrationNumber?,               */
/*         panNumber?, companyDescription?, companyLogo? }            */
/*                                                                     */
/* - Hashes password with bcrypt before storing                       */
/* - Status defaults to "pending" until admin activates               */
/* - Returns safe response (no password)                              */
/* ------------------------------------------------------------------ */

export async function registerCompany(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "registerCompany — start");
  await syncDB();

  try {
    const body = await req.json();
    const {
      companyName, companyCode, email, password,
      industry, companyType,
      registrationNumber, panNumber,
      companyDescription, companyLogo,
    } = body;

    logger.debug(CTX, "registerCompany — payload", { companyName, companyCode, email });

    // ── Validation ──────────────────────────────────────────────────
    if (!companyName?.trim())
      throw new AppError("companyName is required.", 400, "VALIDATION_ERROR");
    if (!companyCode?.trim())
      throw new AppError("companyCode is required.", 400, "VALIDATION_ERROR");
    if (!email?.trim())
      throw new AppError("email is required.", 400, "VALIDATION_ERROR");
    if (!password || String(password).length < 8)
      throw new AppError("password must be at least 8 characters.", 400, "VALIDATION_ERROR");
    if (!industry?.trim())
      throw new AppError("industry is required.", 400, "VALIDATION_ERROR");

    if (companyType !== undefined && !COMPANY_TYPE_VALUES.includes(companyType))
      throw new AppError(
        `companyType must be one of: ${COMPANY_TYPE_VALUES.join(", ")}.`,
        400, "VALIDATION_ERROR",
      );

    // ── Duplicate checks ────────────────────────────────────────────
    const [dupCode, dupEmail] = await Promise.all([
      Company.findOne({ where: { companyCode: companyCode.trim() } }),
      Company.findOne({ where: { email: email.trim().toLowerCase() } }),
    ]);
    if (dupCode)  throw new AppError("companyCode already exists.", 409, "DUPLICATE");
    if (dupEmail) throw new AppError("Email already registered.", 409, "DUPLICATE");

    // ── Hash password ───────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(String(password), 12);

    // ── Create (status = pending) ───────────────────────────────────
    const company = await Company.create({
      companyName:        companyName.trim(),
      companyCode:        companyCode.trim().toUpperCase(),
      email:              email.trim().toLowerCase(),
      password:           hashedPassword,
      companyType:        companyType ?? "Private",
      industry:           industry.trim(),
      status:             "pending",
      registrationNumber: registrationNumber?.trim() || null,
      panNumber:          panNumber?.trim() || null,
      companyDescription: companyDescription?.trim() || null,
      companyLogo:        companyLogo?.trim() || null,
    });

    logger.info(CTX, "registerCompany — created", {
      id: company.id,
      companyCode: company.companyCode,
      email: company.email,
    });

    // Send credentials email to company
    try {
      await sendCompanyCredentials(
        company.companyName,
        company.email,
        password, // Send plain password (before hashing)
        company.companyCode,
      );
      logger.info(CTX, "registerCompany — credentials email sent", { email: company.email });
    } catch (emailError) {
      logger.error(CTX, "registerCompany — email failed (non-blocking)", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted. Login credentials have been sent to your email.",
      data: company.toSafeJSON(),
    }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "registerCompany — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/companies  (admin creates a company directly)            */
/* Same fields as register but admin can set status                   */
/* ------------------------------------------------------------------ */

export async function createCompany(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createCompany — start");
  await syncDB();

  try {
    const body = await req.json();
    const {
      companyName, companyCode, email, password,
      industry, companyType, status,
      registrationNumber, panNumber,
      companyDescription, companyLogo,
    } = body;

    if (!companyName?.trim())
      throw new AppError("companyName is required.", 400, "VALIDATION_ERROR");
    if (!companyCode?.trim())
      throw new AppError("companyCode is required.", 400, "VALIDATION_ERROR");
    if (!email?.trim())
      throw new AppError("email is required.", 400, "VALIDATION_ERROR");
    if (!password || String(password).length < 8)
      throw new AppError("password must be at least 8 characters.", 400, "VALIDATION_ERROR");
    if (!industry?.trim())
      throw new AppError("industry is required.", 400, "VALIDATION_ERROR");

    if (companyType && !COMPANY_TYPE_VALUES.includes(companyType))
      throw new AppError(`companyType must be one of: ${COMPANY_TYPE_VALUES.join(", ")}.`, 400, "VALIDATION_ERROR");
    if (status && !COMPANY_STATUS_VALUES.includes(status))
      throw new AppError(`status must be one of: ${COMPANY_STATUS_VALUES.join(", ")}.`, 400, "VALIDATION_ERROR");

    const [dupCode, dupEmail] = await Promise.all([
      Company.findOne({ where: { companyCode: companyCode.trim() } }),
      Company.findOne({ where: { email: email.trim().toLowerCase() } }),
    ]);
    if (dupCode)  throw new AppError("companyCode already exists.", 409, "DUPLICATE");
    if (dupEmail) throw new AppError("Email already registered.", 409, "DUPLICATE");

    const hashedPassword = await bcrypt.hash(String(password), 12);

    const company = await Company.create({
      companyName:        companyName.trim(),
      companyCode:        companyCode.trim().toUpperCase(),
      email:              email.trim().toLowerCase(),
      password:           hashedPassword,
      companyType:        companyType ?? "Private",
      industry:           industry.trim(),
      status:             status ?? "active",
      registrationNumber: registrationNumber?.trim() || null,
      panNumber:          panNumber?.trim() || null,
      companyDescription: companyDescription?.trim() || null,
      companyLogo:        companyLogo?.trim() || null,
    });

    logger.info(CTX, "createCompany — created", { id: company.id });

    // Send credentials email to company
    try {
      await sendCompanyCredentials(
        company.companyName,
        company.email,
        password, // Send plain password (before hashing)
        company.companyCode,
      );
      logger.info(CTX, "createCompany — credentials email sent", { email: company.email });
    } catch (emailError) {
      logger.error(CTX, "createCompany — email failed (non-blocking)", emailError);
      // Don't fail the creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Company created successfully. Login credentials have been sent to their email.",
      data: company.toSafeJSON(),
    }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createCompany — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PUT /api/companies/:id                                              */
/* ------------------------------------------------------------------ */

export async function updateCompany(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateCompany — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Company ID is required.", 400, "MISSING_ID");

    const company = await Company.findByPk(id);
    if (!company) {
      logger.warn(CTX, "updateCompany — not found", { id });
      throw new AppError("Company not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      companyName, companyCode, email, password,
      companyType, industry, status,
      registrationNumber, panNumber,
      companyDescription, companyLogo,
    } = body;

    const updates: Partial<{
      companyName: string;
      companyCode: string;
      email: string;
      password: string;
      companyType: CompanyType;
      industry: string;
      status: CompanyStatus;
      registrationNumber: string | null;
      panNumber: string | null;
      companyDescription: string | null;
      companyLogo: string | null;
    }> = {};

    if (companyName !== undefined) {
      if (!companyName?.trim()) throw new AppError("companyName cannot be empty.", 400, "VALIDATION_ERROR");
      updates.companyName = companyName.trim();
    }
    if (companyCode !== undefined) {
      if (!companyCode?.trim()) throw new AppError("companyCode cannot be empty.", 400, "VALIDATION_ERROR");
      const code = companyCode.trim().toUpperCase();
      if (code !== company.companyCode) {
        const dup = await Company.findOne({ where: { companyCode: code } });
        if (dup) throw new AppError("companyCode already exists.", 409, "DUPLICATE");
      }
      updates.companyCode = code;
    }
    if (email !== undefined) {
      if (!email?.trim()) throw new AppError("email cannot be empty.", 400, "VALIDATION_ERROR");
      const normalised = email.trim().toLowerCase();
      if (normalised !== company.email) {
        const dup = await Company.findOne({ where: { email: normalised } });
        if (dup) throw new AppError("Email already registered.", 409, "DUPLICATE");
      }
      updates.email = normalised;
    }
    if (password !== undefined) {
      if (String(password).length < 8)
        throw new AppError("password must be at least 8 characters.", 400, "VALIDATION_ERROR");
      updates.password = await bcrypt.hash(String(password), 12);
    }
    if (companyType !== undefined) {
      if (!COMPANY_TYPE_VALUES.includes(companyType))
        throw new AppError(`companyType must be one of: ${COMPANY_TYPE_VALUES.join(", ")}.`, 400, "VALIDATION_ERROR");
      updates.companyType = companyType;
    }
    if (industry !== undefined) {
      if (!industry?.trim()) throw new AppError("industry cannot be empty.", 400, "VALIDATION_ERROR");
      updates.industry = industry.trim();
    }
    if (status !== undefined) {
      if (!COMPANY_STATUS_VALUES.includes(status))
        throw new AppError(`status must be one of: ${COMPANY_STATUS_VALUES.join(", ")}.`, 400, "VALIDATION_ERROR");
      updates.status = status;
    }
    if (registrationNumber !== undefined) updates.registrationNumber = registrationNumber?.trim() || null;
    if (panNumber          !== undefined) updates.panNumber          = panNumber?.trim() || null;
    if (companyDescription !== undefined) updates.companyDescription = companyDescription?.trim() || null;
    if (companyLogo        !== undefined) updates.companyLogo        = companyLogo?.trim() || null;

    await company.update(updates);

    logger.info(CTX, "updateCompany — updated", { id });

    return NextResponse.json({ success: true, data: company.toSafeJSON() }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateCompany — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/companies/:id                                           */
/* ------------------------------------------------------------------ */

export async function deleteCompany(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteCompany — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Company ID is required.", 400, "MISSING_ID");

    const company = await Company.findByPk(id);
    if (!company) {
      logger.warn(CTX, "deleteCompany — not found", { id });
      throw new AppError("Company not found.", 404, "NOT_FOUND");
    }

    const { companyName, companyCode, email } = company;
    await company.destroy();

    logger.info(CTX, "deleteCompany — deleted", { id, companyCode });

    return NextResponse.json({
      success: true,
      message: "Company deleted.",
      data: { id, companyName, companyCode, email },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteCompany — failed", { id, error });
    return errorResponse(error);
  }
}

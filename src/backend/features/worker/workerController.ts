import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Worker } from "./workerModel";
import type {
  WorkerStatus,
  AvailabilityStatus,
  WorkerAttributes,
} from "./workerModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";
import { syncDB } from "@/lib/sync";

const CTX = "WorkerController";

/* ------------------------------------------------------------------ */
/* JWT helpers                                                         */
/* ------------------------------------------------------------------ */

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-secret-change-in-production",
);
const JWT_EXPIRY = "7d";

async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;
}

/** Extract Bearer token from Authorization header */
function extractBearer(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parsePagination(sp: URLSearchParams) {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  return { page, limit, offset: (page - 1) * limit };
}

function toArray(val: unknown): string[] | null {
  if (val == null) return null;
  if (Array.isArray(val)) {
    const c = val.map((v) => String(v).trim()).filter(Boolean);
    return c.length ? c : null;
  }
  if (typeof val === "string") {
    const c = val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    return c.length ? c : null;
  }
  return null;
}

/** Safe attributes — password never included */
const SAFE: (keyof WorkerAttributes)[] = [
  "id",
  "fullName",
  "email",
  "phone",
  "location",
  "jobCategory",
  "skills",
  "experienceYears",
  "bio",
  "resumeUrl",
  "avatarUrl",
  "status",
  "availability",
  "createdAt",
  "updatedAt",
];

/* ------------------------------------------------------------------ */
/* POST /api/workers/register                                          */
/* Public — workers self-register, immediately active                 */
/* ------------------------------------------------------------------ */

export async function registerWorker(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "registerWorker — start");
  await syncDB();

  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      location,
      jobCategory,
      password,
      skills,
      experienceYears,
      bio,
    } = body;

    // ── Validation ────────────────────────────────────────────────
    if (!fullName?.trim())
      throw new AppError("fullName is required.", 400, "VALIDATION_ERROR");
    if (!email?.trim())
      throw new AppError("email is required.", 400, "VALIDATION_ERROR");
    if (!/\S+@\S+\.\S+/.test(email))
      throw new AppError("Invalid email format.", 400, "VALIDATION_ERROR");
    if (!phone?.trim())
      throw new AppError("phone is required.", 400, "VALIDATION_ERROR");
    if (!location?.trim())
      throw new AppError("location is required.", 400, "VALIDATION_ERROR");
    if (!jobCategory?.trim())
      throw new AppError("jobCategory is required.", 400, "VALIDATION_ERROR");
    if (!password || String(password).length < 8)
      throw new AppError(
        "password must be at least 8 characters.",
        400,
        "VALIDATION_ERROR",
      );

    // ── Duplicate email check ──────────────────────────────────────
    const existing = await Worker.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing)
      throw new AppError("Email already registered.", 409, "DUPLICATE");

    // ── Hash & create ──────────────────────────────────────────────
    const hashed = await bcrypt.hash(String(password), 12);

    const worker = await Worker.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      phone: phone.trim(),
      location: location.trim(),
      jobCategory: jobCategory.trim(),
      skills: toArray(skills),
      experienceYears: experienceYears != null ? Number(experienceYears) : null,
      bio: bio?.trim() || null,
      status: "active",
      availability: "available",
    });

    // ── Issue JWT immediately — worker is logged in after register ─
    const token = await signToken({
      sub: worker.id,
      role: "worker",
      email: worker.email,
    });

    logger.info(CTX, "registerWorker — created", {
      id: worker.id,
      email: worker.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Welcome to ZYLO BRAINS!",
        token,
        worker: worker.toSafeJSON(),
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error(CTX, "registerWorker — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/workers/login                                             */
/* Public — email + password, returns JWT                             */
/* ------------------------------------------------------------------ */

export async function loginWorker(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "loginWorker — start");
  await syncDB();

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email?.trim())
      throw new AppError("email is required.", 400, "VALIDATION_ERROR");
    if (!password)
      throw new AppError("password is required.", 400, "VALIDATION_ERROR");

    const worker = await Worker.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    // Same error for not-found vs wrong-password (security: don't leak existence)
    const INVALID = new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS",
    );
    if (!worker) throw INVALID;

    if (worker.status === "suspended")
      throw new AppError(
        "Your account has been suspended. Contact support.",
        403,
        "SUSPENDED",
      );

    const valid = await bcrypt.compare(String(password), worker.password);
    if (!valid) throw INVALID;

    const token = await signToken({
      sub: worker.id,
      role: "worker",
      email: worker.email,
    });

    logger.info(CTX, "loginWorker — success", {
      id: worker.id,
      email: worker.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        token,
        worker: worker.toSafeJSON(),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "loginWorker — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/workers/me                                                 */
/* Auth required — returns current worker profile                     */
/* ------------------------------------------------------------------ */

export async function getMe(req: NextRequest): Promise<NextResponse> {
  await syncDB();

  try {
    const token = extractBearer(req);
    if (!token)
      throw new AppError("Authentication required.", 401, "UNAUTHORIZED");

    const payload = await verifyToken(token);
    const id = payload.sub as string;

    const worker = await Worker.findByPk(id, { attributes: SAFE });
    if (!worker) throw new AppError("Worker not found.", 404, "NOT_FOUND");

    return NextResponse.json({ success: true, worker }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getMe — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PUT /api/workers/me                                                 */
/* Auth required — update own profile (NOT password)                  */
/* ------------------------------------------------------------------ */

export async function updateMe(req: NextRequest): Promise<NextResponse> {
  await syncDB();

  try {
    const token = extractBearer(req);
    if (!token)
      throw new AppError("Authentication required.", 401, "UNAUTHORIZED");

    const payload = await verifyToken(token);
    const id = payload.sub as string;

    const worker = await Worker.findByPk(id);
    if (!worker) throw new AppError("Worker not found.", 404, "NOT_FOUND");

    const body = await req.json();
    const {
      fullName,
      phone,
      location,
      jobCategory,
      skills,
      experienceYears,
      bio,
      availability,
    } = body;

    const updates: Partial<{
      fullName: string;
      phone: string;
      location: string;
      jobCategory: string;
      skills: string[] | null;
      experienceYears: number | null;
      bio: string | null;
      availability: AvailabilityStatus;
    }> = {};

    if (fullName !== undefined) {
      if (!fullName?.trim())
        throw new AppError(
          "fullName cannot be empty.",
          400,
          "VALIDATION_ERROR",
        );
      updates.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      if (!phone?.trim())
        throw new AppError("phone cannot be empty.", 400, "VALIDATION_ERROR");
      updates.phone = phone.trim();
    }
    if (location !== undefined) {
      if (!location?.trim())
        throw new AppError(
          "location cannot be empty.",
          400,
          "VALIDATION_ERROR",
        );
      updates.location = location.trim();
    }
    if (jobCategory !== undefined) {
      if (!jobCategory?.trim())
        throw new AppError(
          "jobCategory cannot be empty.",
          400,
          "VALIDATION_ERROR",
        );
      updates.jobCategory = jobCategory.trim();
    }
    if (skills !== undefined) updates.skills = toArray(skills);
    if (experienceYears !== undefined)
      updates.experienceYears =
        experienceYears != null ? Number(experienceYears) : null;
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (availability !== undefined) updates.availability = availability;

    await worker.update(updates);

    logger.info(CTX, "updateMe — updated", { id });
    return NextResponse.json(
      { success: true, worker: worker.toSafeJSON() },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "updateMe — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PUT /api/workers/me/password                                        */
/* Auth required — change own password                                */
/* ------------------------------------------------------------------ */

export async function changePassword(req: NextRequest): Promise<NextResponse> {
  await syncDB();

  try {
    const token = extractBearer(req);
    if (!token)
      throw new AppError("Authentication required.", 401, "UNAUTHORIZED");

    const payload = await verifyToken(token);
    const id = payload.sub as string;

    const worker = await Worker.findByPk(id);
    if (!worker) throw new AppError("Worker not found.", 404, "NOT_FOUND");

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword)
      throw new AppError(
        "currentPassword is required.",
        400,
        "VALIDATION_ERROR",
      );
    if (!newPassword || String(newPassword).length < 8)
      throw new AppError(
        "newPassword must be at least 8 characters.",
        400,
        "VALIDATION_ERROR",
      );

    const valid = await bcrypt.compare(
      String(currentPassword),
      worker.password,
    );
    if (!valid)
      throw new AppError(
        "Current password is incorrect.",
        400,
        "INVALID_CREDENTIALS",
      );

    await worker.update({
      password: await bcrypt.hash(String(newPassword), 12),
    });

    logger.info(CTX, "changePassword — updated", { id });
    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "changePassword — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/workers   (admin only)                                     */
/* ------------------------------------------------------------------ */

export async function getAllWorkers(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllWorkers — start");
  await syncDB();

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get("search")?.trim();
    const jobCategory = searchParams.get("jobCategory")?.trim();
    const location = searchParams.get("location")?.trim();
    const status = searchParams.get("status")?.trim();
    const availability = searchParams.get("availability")?.trim();

    const where: Record<string, unknown> = {};
    if (jobCategory) where.jobCategory = jobCategory;
    if (location) where.location = location;
    if (status) where.status = status;
    if (availability) where.availability = availability;

    if (search) {
      where[Op.or as unknown as string] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { jobCategory: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Worker.findAndCountAll({
      attributes: SAFE,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAllWorkers — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllWorkers — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/workers/:id  (admin only)                                  */
/* ------------------------------------------------------------------ */

export async function getWorkerById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getWorkerById — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Worker ID is required.", 400, "MISSING_ID");

    const worker = await Worker.findByPk(id, { attributes: SAFE });
    if (!worker) {
      logger.warn(CTX, "getWorkerById — not found", { id });
      throw new AppError("Worker not found.", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: worker }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getWorkerById — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PUT /api/workers/:id  (admin — update status)                       */
/* ------------------------------------------------------------------ */

export async function updateWorkerByAdmin(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateWorkerByAdmin — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Worker ID is required.", 400, "MISSING_ID");

    const worker = await Worker.findByPk(id);
    if (!worker) throw new AppError("Worker not found.", 404, "NOT_FOUND");

    const { status, availability } = await req.json();
    const updates: Partial<{
      status: WorkerStatus;
      availability: AvailabilityStatus;
    }> = {};

    const VALID_STATUS: WorkerStatus[] = ["active", "inactive", "suspended"];
    const VALID_AVAIL: AvailabilityStatus[] = [
      "available",
      "employed",
      "not_looking",
    ];

    if (status !== undefined) {
      if (!VALID_STATUS.includes(status))
        throw new AppError(
          `status must be one of: ${VALID_STATUS.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.status = status;
    }
    if (availability !== undefined) {
      if (!VALID_AVAIL.includes(availability))
        throw new AppError(
          `availability must be one of: ${VALID_AVAIL.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      updates.availability = availability;
    }

    await worker.update(updates);
    logger.info(CTX, "updateWorkerByAdmin — updated", { id });

    return NextResponse.json(
      { success: true, data: worker.toSafeJSON() },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "updateWorkerByAdmin — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/workers/:id  (admin only)                               */
/* ------------------------------------------------------------------ */

export async function deleteWorker(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteWorker — start", { id });
  await syncDB();

  try {
    if (!id) throw new AppError("Worker ID is required.", 400, "MISSING_ID");

    const worker = await Worker.findByPk(id);
    if (!worker) throw new AppError("Worker not found.", 404, "NOT_FOUND");

    const { fullName, email } = worker;
    await worker.destroy();

    logger.info(CTX, "deleteWorker — deleted", { id, email });
    return NextResponse.json(
      {
        success: true,
        message: "Worker deleted.",
        data: { id, fullName, email },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteWorker — failed", { id, error });
    return errorResponse(error);
  }
}

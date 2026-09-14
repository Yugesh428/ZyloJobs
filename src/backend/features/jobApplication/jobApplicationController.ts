import { NextRequest, NextResponse } from "next/server";
import JobApplication from "./jobApplicationModel";
import Job from "../jobCreation/jobCreationModel";
import { Worker } from "../worker/workerModel";
import {
  saveFile,
  deleteFile,
  uniqueFilename,
  ALLOWED_CV_TYPES,
  MAX_CV_SIZE_BYTES,
  type AllowedCvType,
} from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "JobApplicationController";

/* ------------------------------------------------------------------ */
/* GET /api/applications                                              */
/* Query params: ?page, ?limit, ?status                               */
/* Returns paginated list of all applications (admin use)             */
/* ------------------------------------------------------------------ */

export async function getAllApplications(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllApplications — start");

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status")?.trim();

    const offset = (page - 1) * limit;

    const where: { status?: string } = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const { count, rows } = await JobApplication.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobRole"],
        },
        {
          model: Worker,
          as: "worker",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    logger.info(CTX, "getAllApplications — found", { count, page, limit });

    return NextResponse.json(
      {
        success: true,
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getAllApplications — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/applications                                              */
/* Body: multipart/form-data                                          */
/*   jobId      string   (required)                                   */
/*   workerId   string   (required — from auth session in production) */
/*   coverNote  string   (optional)                                   */
/*   cv         File     (optional — PDF / DOC / DOCX, max 5 MB)     */
/* ------------------------------------------------------------------ */

export async function createApplication(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createApplication — start");

  try {
    const formData = await req.formData();

    const jobId     = (formData.get("jobId")     as string | null)?.trim();
    const workerId  = (formData.get("workerId")  as string | null)?.trim();
    const coverNote = (formData.get("coverNote") as string | null)?.trim() || null;
    const cvFile    = formData.get("cv") as File | null;

    // ── Validation ────────────────────────────────────────────────────
    if (!jobId)    throw new AppError("jobId is required.",    400, "VALIDATION_ERROR");
    if (!workerId) throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");

    // ── Duplicate check ───────────────────────────────────────────────
    const existing = await JobApplication.findOne({ where: { jobId, workerId } });
    if (existing) {
      throw new AppError("You have already applied for this job.", 409, "DUPLICATE");
    }

    // ── CV upload (optional) ──────────────────────────────────────────
    let cvUrl: string | null = null;

    if (cvFile && cvFile.size > 0) {
      logger.debug(CTX, "createApplication — CV received", {
        name: cvFile.name,
        type: cvFile.type,
        size: cvFile.size,
      });

      if (!ALLOWED_CV_TYPES.includes(cvFile.type as AllowedCvType)) {
        throw new AppError(
          "Invalid file type. Only PDF, DOC, and DOCX are allowed.",
          400,
          "INVALID_FILE_TYPE",
        );
      }

      if (cvFile.size > MAX_CV_SIZE_BYTES) {
        throw new AppError(
          "CV file size must not exceed 5 MB.",
          400,
          "FILE_TOO_LARGE",
        );
      }

      const buffer   = Buffer.from(await cvFile.arrayBuffer());
      const filename = uniqueFilename(cvFile.name);
      cvUrl = await saveFile(buffer, filename, "cvs");

      logger.info(CTX, "createApplication — CV saved", { cvUrl });
    }

    // ── Create application ────────────────────────────────────────────
    const application = await JobApplication.create({
      jobId,
      workerId,
      coverNote,
      cvUrl,
    });

    logger.info(CTX, "createApplication — created", { id: application.id });

    return NextResponse.json(
      { success: true, data: application },
      { status: 201 },
    );
  } catch (error) {
    logger.error(CTX, "createApplication — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/applications/me?workerId=<id>                             */
/* Returns all applications for a specific worker.                    */
/* ------------------------------------------------------------------ */

export async function getMyApplications(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getMyApplications — start");

  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId")?.trim();

    if (!workerId) throw new AppError("workerId is required.", 400, "MISSING_PARAM");

    const applications = await JobApplication.findAll({
      where: { workerId },
      order: [["createdAt", "DESC"]],
    });

    logger.info(CTX, "getMyApplications — found", { count: applications.length });

    return NextResponse.json(
      { success: true, data: applications },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getMyApplications — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/applications/job/:jobId                                   */
/* Returns all applicants for a job (admin use).                      */
/* ------------------------------------------------------------------ */

export async function getApplicationsByJob(
  _req: NextRequest,
  jobId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getApplicationsByJob — start", { jobId });

  try {
    if (!jobId) throw new AppError("jobId is required.", 400, "MISSING_PARAM");

    const applications = await JobApplication.findAll({
      where: { jobId },
      order: [["createdAt", "DESC"]],
    });

    logger.info(CTX, "getApplicationsByJob — found", {
      jobId,
      count: applications.length,
    });

    return NextResponse.json(
      { success: true, data: applications },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getApplicationsByJob — failed", { jobId, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/applications/:id/status                                 */
/* Body: { status: ApplicationStatus }  (admin use)                  */
/* ------------------------------------------------------------------ */

export async function updateApplicationStatus(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateApplicationStatus — start", { id });

  try {
    if (!id) throw new AppError("Application ID is required.", 400, "MISSING_ID");

    const application = await JobApplication.findByPk(id);
    if (!application) {
      throw new AppError("Application not found.", 404, "NOT_FOUND");
    }

    const body   = await req.json();
    const { status } = body;

    const VALID = ["applied", "reviewing", "shortlisted", "rejected", "hired"];
    if (!status || !VALID.includes(status)) {
      throw new AppError(
        `status must be one of: ${VALID.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );
    }

    await application.update({ status });

    logger.info(CTX, "updateApplicationStatus — updated", { id, status });

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "updateApplicationStatus — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/applications/:id                                       */
/* Worker withdraws their application. Deletes CV file if present.   */
/* ------------------------------------------------------------------ */

export async function deleteApplication(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteApplication — start", { id });

  try {
    if (!id) throw new AppError("Application ID is required.", 400, "MISSING_ID");

    const application = await JobApplication.findByPk(id);
    if (!application) {
      throw new AppError("Application not found.", 404, "NOT_FOUND");
    }

    // Delete local CV file if it was uploaded
    if (application.cvUrl) {
      await deleteFile(application.cvUrl);
      logger.info(CTX, "deleteApplication — CV deleted", { cvUrl: application.cvUrl });
    }

    await application.destroy();

    logger.info(CTX, "deleteApplication — deleted", { id });

    return NextResponse.json(
      { success: true, message: "Application withdrawn.", data: { id } },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteApplication — failed", { id, error });
    return errorResponse(error);
  }
}

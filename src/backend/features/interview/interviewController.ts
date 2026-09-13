import { NextRequest, NextResponse } from "next/server";
import Interview from "./interviewModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "InterviewController";

const VALID_TYPES    = ["in-person", "phone", "video"] as const;
const VALID_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no-show"] as const;

/* ------------------------------------------------------------------ */
/* POST /api/interviews                                                */
/* Admin schedules an interview for a shortlisted application.        */
/*                                                                     */
/* Body:                                                               */
/*   applicationId   string   (required)                              */
/*   workerId        string   (required)                              */
/*   jobId           string   (required)                              */
/*   type            string   in-person | phone | video               */
/*   scheduledAt     string   ISO date-time                           */
/*   durationMinutes number   (optional, default 30)                  */
/*   location        string   (optional — for in-person)              */
/*   meetingLink     string   (optional — for phone/video)            */
/*   notes           string   (optional)                              */
/*   round           number   (optional, default auto-increments)     */
/* ------------------------------------------------------------------ */

export async function createInterview(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createInterview — start");

  try {
    const body = await req.json();
    const {
      applicationId,
      workerId,
      jobId,
      type,
      scheduledAt,
      durationMinutes,
      location,
      meetingLink,
      notes,
      round: roundInput,
    } = body;

    // ── Validation ────────────────────────────────────────────────────
    if (!applicationId) throw new AppError("applicationId is required.", 400, "VALIDATION_ERROR");
    if (!workerId)       throw new AppError("workerId is required.",      400, "VALIDATION_ERROR");
    if (!jobId)          throw new AppError("jobId is required.",         400, "VALIDATION_ERROR");
    if (!type || !VALID_TYPES.includes(type)) {
      throw new AppError(
        `type must be one of: ${VALID_TYPES.join(", ")}.`,
        400,
        "VALIDATION_ERROR",
      );
    }
    if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
      throw new AppError("scheduledAt must be a valid ISO date-time.", 400, "VALIDATION_ERROR");
    }

    // ── Type-specific validation ──────────────────────────────────────
    if (type === "in-person" && !location?.trim()) {
      throw new AppError("location is required for in-person interviews.", 400, "VALIDATION_ERROR");
    }
    if ((type === "phone" || type === "video") && !meetingLink?.trim()) {
      throw new AppError(
        "meetingLink is required for phone and video interviews.",
        400,
        "VALIDATION_ERROR",
      );
    }

    // ── Auto-determine round if not provided ─────────────────────────
    let round = roundInput;
    if (!round) {
      const lastInterview = await Interview.findOne({
        where: { applicationId },
        order: [["round", "DESC"]],
      });
      round = lastInterview ? lastInterview.round + 1 : 1;
    }

    // ── Duplicate round check ─────────────────────────────────────────
    const dupRound = await Interview.findOne({ where: { applicationId, round } });
    if (dupRound) {
      throw new AppError(
        `Round ${round} already exists for this application.`,
        409,
        "DUPLICATE",
      );
    }

    // ── Create ────────────────────────────────────────────────────────
    const interview = await Interview.create({
      applicationId,
      workerId,
      jobId,
      round,
      type,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes ?? 30,
      location:    location?.trim()    || null,
      meetingLink: meetingLink?.trim() || null,
      notes:       notes?.trim()       || null,
    });

    logger.info(CTX, "createInterview — created", {
      id: interview.id,
      applicationId,
      round: interview.round,
    });

    return NextResponse.json(
      { success: true, data: interview },
      { status: 201 },
    );
  } catch (error) {
    logger.error(CTX, "createInterview — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/interviews/application/:applicationId                     */
/* All rounds for a given application (admin or worker).              */
/* ------------------------------------------------------------------ */

export async function getInterviewsByApplication(
  _req: NextRequest,
  applicationId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getInterviewsByApplication — start", { applicationId });

  try {
    if (!applicationId) throw new AppError("applicationId is required.", 400, "MISSING_PARAM");

    const interviews = await Interview.findAll({
      where: { applicationId },
      order: [["round", "ASC"]],
    });

    return NextResponse.json(
      { success: true, data: interviews },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getInterviewsByApplication — failed", { applicationId, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/interviews/worker/:workerId                               */
/* All interviews for a specific worker (worker's own schedule).      */
/* ------------------------------------------------------------------ */

export async function getInterviewsByWorker(
  _req: NextRequest,
  workerId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getInterviewsByWorker — start", { workerId });

  try {
    if (!workerId) throw new AppError("workerId is required.", 400, "MISSING_PARAM");

    const interviews = await Interview.findAll({
      where: { workerId },
      order: [["scheduledAt", "ASC"]],
    });

    return NextResponse.json(
      { success: true, data: interviews },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getInterviewsByWorker — failed", { workerId, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/interviews/:id                                            */
/* Single interview detail.                                           */
/* ------------------------------------------------------------------ */

export async function getInterviewById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getInterviewById — start", { id });

  try {
    if (!id) throw new AppError("Interview ID is required.", 400, "MISSING_ID");

    const interview = await Interview.findByPk(id);
    if (!interview) throw new AppError("Interview not found.", 404, "NOT_FOUND");

    return NextResponse.json(
      { success: true, data: interview },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getInterviewById — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/interviews/:id                                          */
/* Admin updates interview details or status.                         */
/* Also accepts `feedback` after completion.                          */
/* ------------------------------------------------------------------ */

export async function updateInterview(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateInterview — start", { id });

  try {
    if (!id) throw new AppError("Interview ID is required.", 400, "MISSING_ID");

    const interview = await Interview.findByPk(id);
    if (!interview) throw new AppError("Interview not found.", 404, "NOT_FOUND");

    const body = await req.json();
    const {
      type,
      scheduledAt,
      durationMinutes,
      location,
      meetingLink,
      notes,
      feedback,
      status,
    } = body;

    const updates: Partial<{
      type: typeof VALID_TYPES[number];
      scheduledAt: Date;
      durationMinutes: number;
      location: string | null;
      meetingLink: string | null;
      notes: string | null;
      feedback: string | null;
      status: typeof VALID_STATUSES[number];
    }> = {};

    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        throw new AppError(`type must be one of: ${VALID_TYPES.join(", ")}.`, 400, "VALIDATION_ERROR");
      }
      updates.type = type;
    }

    if (scheduledAt !== undefined) {
      if (isNaN(Date.parse(scheduledAt))) {
        throw new AppError("scheduledAt must be a valid ISO date-time.", 400, "VALIDATION_ERROR");
      }
      updates.scheduledAt = new Date(scheduledAt);
    }

    if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes;
    if (location        !== undefined) updates.location        = location?.trim() || null;
    if (meetingLink     !== undefined) updates.meetingLink     = meetingLink?.trim() || null;
    if (notes           !== undefined) updates.notes           = notes?.trim() || null;
    if (feedback        !== undefined) updates.feedback        = feedback?.trim() || null;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        throw new AppError(
          `status must be one of: ${VALID_STATUSES.join(", ")}.`,
          400,
          "VALIDATION_ERROR",
        );
      }
      updates.status = status;
    }

    await interview.update(updates);

    logger.info(CTX, "updateInterview — updated", { id });

    return NextResponse.json(
      { success: true, data: interview },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "updateInterview — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/interviews/:id                                         */
/* Admin cancels and removes an interview.                            */
/* ------------------------------------------------------------------ */

export async function deleteInterview(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteInterview — start", { id });

  try {
    if (!id) throw new AppError("Interview ID is required.", 400, "MISSING_ID");

    const interview = await Interview.findByPk(id);
    if (!interview) throw new AppError("Interview not found.", 404, "NOT_FOUND");

    await interview.destroy();

    logger.info(CTX, "deleteInterview — deleted", { id });

    return NextResponse.json(
      { success: true, message: "Interview deleted.", data: { id } },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteInterview — failed", { id, error });
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Attendance, {
  type AttendanceStatus,
  type LeaveType,
} from "./attendanceModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "AttendanceController";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const VALID_STATUSES: AttendanceStatus[] = [
  "present", "absent", "half_day", "leave", "holiday", "late", "early_leave",
];

const VALID_LEAVE_TYPES: LeaveType[] = [
  "annual", "sick", "unpaid", "maternity", "paternity", "other",
];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parsePagination(sp: URLSearchParams) {
  const page  = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "31")));
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Compute workedMinutes and overtimeMinutes from two timestamps.
 * Returns null for both if clockOut is missing.
 */
function computeMinutes(
  clockIn: Date,
  clockOut: Date,
  scheduledMinutes: number,
): { workedMinutes: number; overtimeMinutes: number } {
  const worked = Math.max(
    0,
    Math.floor((clockOut.getTime() - clockIn.getTime()) / 60_000),
  );
  const overtime = Math.max(0, worked - scheduledMinutes);
  return { workedMinutes: worked, overtimeMinutes: overtime };
}

/**
 * Derive attendance status from worked minutes vs scheduled.
 * Only used when admin doesn't override status manually.
 */
function deriveStatus(
  workedMinutes: number,
  scheduledMinutes: number,
  clockInTime: Date,
  scheduledStartIso: string | null,
): AttendanceStatus {
  const ratio = workedMinutes / scheduledMinutes;
  if (ratio <= 0)    return "absent";
  if (ratio < 0.5)   return "half_day";

  // Late detection: compare clockIn to expected start (if provided)
  if (scheduledStartIso) {
    const expectedStart = new Date(scheduledStartIso);
    const lateThresholdMs = 15 * 60 * 1000; // 15 min grace
    if (clockInTime.getTime() - expectedStart.getTime() > lateThresholdMs) {
      return "late";
    }
  }

  return "present";
}

/* ------------------------------------------------------------------ */
/* POST /api/attendance/clock-in                                       */
/* Worker clocks in for the day.                                       */
/* Body: { onboardingId, workerId, companyId, scheduledMinutes? }     */
/* ------------------------------------------------------------------ */

export async function clockIn(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "clockIn — start");

  try {
    const body = await req.json();
    const { onboardingId, workerId, companyId, scheduledMinutes } = body;

    if (!onboardingId) throw new AppError("onboardingId is required.", 400, "VALIDATION_ERROR");
    if (!workerId)     throw new AppError("workerId is required.",     400, "VALIDATION_ERROR");
    if (!companyId)    throw new AppError("companyId is required.",    400, "VALIDATION_ERROR");

    const now      = new Date();
    const workDate = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // ── Prevent double clock-in ───────────────────────────────────────
    const existing = await Attendance.findOne({ where: { workerId, workDate } });
    if (existing) {
      if (existing.clockIn) {
        throw new AppError(
          "Already clocked in for today.",
          409,
          "ALREADY_CLOCKED_IN",
        );
      }
      // Record exists (e.g. created by admin for leave) but no clockIn yet
      await existing.update({ clockIn: now, status: "present" });
      logger.info(CTX, "clockIn — updated existing record", { id: existing.id });
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }

    const record = await Attendance.create({
      onboardingId,
      workerId,
      companyId,
      workDate,
      clockIn: now,
      scheduledMinutes: scheduledMinutes ?? 480,
      status: "present",
    });

    logger.info(CTX, "clockIn — created", { id: record.id, workDate });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "clockIn — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/attendance/clock-out                                      */
/* Worker clocks out. Computes workedMinutes + status automatically.  */
/* Body: { workerId, scheduledStartIso? }                             */
/* ------------------------------------------------------------------ */

export async function clockOut(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "clockOut — start");

  try {
    const body = await req.json();
    const { workerId, scheduledStartIso } = body;

    if (!workerId) throw new AppError("workerId is required.", 400, "VALIDATION_ERROR");

    const now      = new Date();
    const workDate = now.toISOString().slice(0, 10);

    const record = await Attendance.findOne({ where: { workerId, workDate } });
    if (!record) {
      throw new AppError("No clock-in record found for today.", 404, "NOT_CLOCKED_IN");
    }
    if (!record.clockIn) {
      throw new AppError("Clock-in time is missing.", 400, "MISSING_CLOCK_IN");
    }
    if (record.clockOut) {
      throw new AppError("Already clocked out for today.", 409, "ALREADY_CLOCKED_OUT");
    }

    const { workedMinutes, overtimeMinutes } = computeMinutes(
      record.clockIn,
      now,
      record.scheduledMinutes,
    );

    const status = deriveStatus(
      workedMinutes,
      record.scheduledMinutes,
      record.clockIn,
      scheduledStartIso ?? null,
    );

    await record.update({ clockOut: now, workedMinutes, overtimeMinutes, status });

    logger.info(CTX, "clockOut — updated", {
      id: record.id,
      workedMinutes,
      overtimeMinutes,
      status,
    });

    return NextResponse.json({ success: true, data: record }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "clockOut — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/attendance                                                 */
/* List records with filters. Used for timesheets and reports.        */
/* Query: workerId?, companyId?, onboardingId?, status?,              */
/*        from? (YYYY-MM-DD), to? (YYYY-MM-DD), page?, limit?        */
/* ------------------------------------------------------------------ */

export async function getAttendance(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAttendance — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);

    const workerId     = searchParams.get("workerId")?.trim();
    const companyId    = searchParams.get("companyId")?.trim();
    const onboardingId = searchParams.get("onboardingId")?.trim();
    const status       = searchParams.get("status")?.trim();
    const from         = searchParams.get("from")?.trim();
    const to           = searchParams.get("to")?.trim();

    const where: Record<string, unknown> = {};

    if (workerId)     where.workerId     = workerId;
    if (companyId)    where.companyId    = companyId;
    if (onboardingId) where.onboardingId = onboardingId;
    if (status)       where.status       = status;

    if (from || to) {
      const dateFilter: Record<string, unknown> = {};
      if (from) dateFilter[Op.gte as unknown as string] = from;
      if (to)   dateFilter[Op.lte as unknown as string] = to;
      where.workDate = dateFilter;
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      order: [["workDate", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    logger.info(CTX, `getAttendance — ${rows.length} of ${count}`);

    return NextResponse.json(
      {
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
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getAttendance — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/attendance/summary                                         */
/* Monthly summary for a worker: totals per status type.              */
/* Query: workerId (required), month "YYYY-MM" (required)             */
/* ------------------------------------------------------------------ */

export async function getAttendanceSummary(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAttendanceSummary — start");

  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId")?.trim();
    const month    = searchParams.get("month")?.trim(); // "YYYY-MM"

    if (!workerId) throw new AppError("workerId is required.", 400, "MISSING_PARAM");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new AppError("month must be in YYYY-MM format.", 400, "VALIDATION_ERROR");
    }

    const from = `${month}-01`;
    // Last day of month
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, "0")}`;

    const records = await Attendance.findAll({
      where: {
        workerId,
        workDate: { [Op.between]: [from, to] },
      },
      order: [["workDate", "ASC"]],
    });

    // Aggregate
    const summary = {
      month,
      workerId,
      totalDays:       records.length,
      present:         0,
      absent:          0,
      halfDay:         0,
      leave:           0,
      holiday:         0,
      late:            0,
      earlyLeave:      0,
      totalWorkedMinutes:   0,
      totalOvertimeMinutes: 0,
    };

    for (const r of records) {
      switch (r.status) {
        case "present":     summary.present++;     break;
        case "absent":      summary.absent++;      break;
        case "half_day":    summary.halfDay++;      break;
        case "leave":       summary.leave++;       break;
        case "holiday":     summary.holiday++;     break;
        case "late":        summary.late++;        break;
        case "early_leave": summary.earlyLeave++;  break;
      }
      summary.totalWorkedMinutes   += r.workedMinutes   ?? 0;
      summary.totalOvertimeMinutes += r.overtimeMinutes ?? 0;
    }

    logger.info(CTX, "getAttendanceSummary — done", { workerId, month });

    return NextResponse.json(
      { success: true, data: { summary, records } },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "getAttendanceSummary — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/attendance/:id                                             */
/* Single attendance record.                                          */
/* ------------------------------------------------------------------ */

export async function getAttendanceById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getAttendanceById — start", { id });

  try {
    if (!id) throw new AppError("Attendance ID is required.", 400, "MISSING_ID");

    const record = await Attendance.findByPk(id);
    if (!record) throw new AppError("Attendance record not found.", 404, "NOT_FOUND");

    return NextResponse.json({ success: true, data: record }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAttendanceById — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/attendance                                                */
/* Admin manually creates an attendance record (leave, holiday, etc.) */
/* Body: { onboardingId, workerId, companyId, workDate, status,      */
/*         scheduledMinutes?, leaveType?, clockIn?, clockOut?,        */
/*         adminNote? }                                               */
/* ------------------------------------------------------------------ */

export async function createAttendance(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createAttendance — start");

  try {
    const body = await req.json();
    const {
      onboardingId,
      workerId,
      companyId,
      workDate,
      status,
      scheduledMinutes,
      leaveType,
      clockIn: clockInRaw,
      clockOut: clockOutRaw,
      adminNote,
    } = body;

    // ── Validation ────────────────────────────────────────────────────
    if (!onboardingId) throw new AppError("onboardingId is required.", 400, "VALIDATION_ERROR");
    if (!workerId)     throw new AppError("workerId is required.",     400, "VALIDATION_ERROR");
    if (!companyId)    throw new AppError("companyId is required.",    400, "VALIDATION_ERROR");

    if (!workDate || !ISO_DATE_RE.test(workDate)) {
      throw new AppError("workDate must be in YYYY-MM-DD format.", 400, "VALIDATION_ERROR");
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      throw new AppError(`status must be one of: ${VALID_STATUSES.join(", ")}.`, 400, "VALIDATION_ERROR");
    }
    if (status === "leave" && (!leaveType || !VALID_LEAVE_TYPES.includes(leaveType))) {
      throw new AppError(`leaveType is required when status is "leave". Must be one of: ${VALID_LEAVE_TYPES.join(", ")}.`, 400, "VALIDATION_ERROR");
    }

    // ── Duplicate check ───────────────────────────────────────────────
    const existing = await Attendance.findOne({ where: { workerId, workDate } });
    if (existing) {
      throw new AppError("Attendance record already exists for this worker on this date.", 409, "DUPLICATE");
    }

    // ── Compute minutes if clock times provided ───────────────────────
    let workedMinutes: number | null   = null;
    let overtimeMinutes: number | null = null;
    const clockInDate  = clockInRaw  ? new Date(clockInRaw)  : null;
    const clockOutDate = clockOutRaw ? new Date(clockOutRaw) : null;

    if (clockInDate && clockOutDate) {
      const computed = computeMinutes(clockInDate, clockOutDate, scheduledMinutes ?? 480);
      workedMinutes   = computed.workedMinutes;
      overtimeMinutes = computed.overtimeMinutes;
    }

    const record = await Attendance.create({
      onboardingId,
      workerId,
      companyId,
      workDate,
      status,
      scheduledMinutes: scheduledMinutes ?? 480,
      clockIn:  clockInDate,
      clockOut: clockOutDate,
      workedMinutes,
      overtimeMinutes,
      leaveType:  status === "leave" ? leaveType : null,
      adminNote:  adminNote?.trim() || null,
    });

    logger.info(CTX, "createAttendance — created", { id: record.id, workDate });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createAttendance — failed", error);
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/attendance/:id                                          */
/* Admin corrects a record (fix status, add note, adjust times).      */
/* ------------------------------------------------------------------ */

export async function updateAttendance(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateAttendance — start", { id });

  try {
    if (!id) throw new AppError("Attendance ID is required.", 400, "MISSING_ID");

    const record = await Attendance.findByPk(id);
    if (!record) throw new AppError("Attendance record not found.", 404, "NOT_FOUND");

    const body = await req.json();
    const {
      status,
      leaveType,
      clockIn:  clockInRaw,
      clockOut: clockOutRaw,
      scheduledMinutes,
      adminNote,
    } = body;

    const updates: Partial<{
      status: AttendanceStatus;
      leaveType: LeaveType | null;
      clockIn: Date | null;
      clockOut: Date | null;
      workedMinutes: number | null;
      overtimeMinutes: number | null;
      scheduledMinutes: number;
      adminNote: string | null;
    }> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        throw new AppError(`status must be one of: ${VALID_STATUSES.join(", ")}.`, 400, "VALIDATION_ERROR");
      }
      updates.status = status;
      if (status === "leave") {
        if (!leaveType || !VALID_LEAVE_TYPES.includes(leaveType)) {
          throw new AppError(`leaveType is required when status is "leave".`, 400, "VALIDATION_ERROR");
        }
        updates.leaveType = leaveType;
      } else {
        updates.leaveType = null;
      }
    }

    const newScheduled = scheduledMinutes ?? record.scheduledMinutes;
    if (scheduledMinutes !== undefined) updates.scheduledMinutes = newScheduled;

    const newClockIn  = clockInRaw  ? new Date(clockInRaw)  : record.clockIn;
    const newClockOut = clockOutRaw ? new Date(clockOutRaw) : record.clockOut;

    if (clockInRaw  !== undefined) updates.clockIn  = newClockIn;
    if (clockOutRaw !== undefined) updates.clockOut = newClockOut;

    // Recompute minutes if we have both times
    if (newClockIn && newClockOut) {
      const computed = computeMinutes(newClockIn, newClockOut, newScheduled);
      updates.workedMinutes   = computed.workedMinutes;
      updates.overtimeMinutes = computed.overtimeMinutes;
    }

    if (adminNote !== undefined) updates.adminNote = adminNote?.trim() || null;

    await record.update(updates);

    logger.info(CTX, "updateAttendance — updated", { id });

    return NextResponse.json({ success: true, data: record }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateAttendance — failed", { id, error });
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/attendance/:id                                         */
/* Admin removes a record (e.g. duplicate entry).                     */
/* ------------------------------------------------------------------ */

export async function deleteAttendance(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteAttendance — start", { id });

  try {
    if (!id) throw new AppError("Attendance ID is required.", 400, "MISSING_ID");

    const record = await Attendance.findByPk(id);
    if (!record) throw new AppError("Attendance record not found.", 404, "NOT_FOUND");

    await record.destroy();

    logger.info(CTX, "deleteAttendance — deleted", { id });

    return NextResponse.json(
      { success: true, message: "Attendance record deleted.", data: { id } },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteAttendance — failed", { id, error });
    return errorResponse(error);
  }
}

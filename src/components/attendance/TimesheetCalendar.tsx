"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  LogIn,
  LogOut,
  TrendingUp,
  CalendarDays,
  Coffee,
  Plane,
  AlertCircle,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "leave"
  | "holiday"
  | "late"
  | "early_leave";

export type LeaveType =
  | "annual"
  | "sick"
  | "unpaid"
  | "maternity"
  | "paternity"
  | "other";

export interface AttendanceRecord {
  id: string;
  workDate: string;           // "YYYY-MM-DD"
  clockIn: string | null;     // ISO timestamp
  clockOut: string | null;
  workedMinutes: number | null;
  overtimeMinutes: number | null;
  scheduledMinutes: number;
  status: AttendanceStatus;
  leaveType: LeaveType | null;
  adminNote: string | null;
}

export interface AttendanceSummary {
  month: string;
  workerId: string;
  totalDays: number;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  holiday: number;
  late: number;
  earlyLeave: number;
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; bg: string; text: string; dot: string; icon: React.ElementType }
> = {
  present:     { label: "Present",     bg: "bg-success-tint",  text: "text-success",        dot: "bg-success",        icon: LogIn          },
  late:        { label: "Late",        bg: "bg-warning-tint",  text: "text-warning-strong",  dot: "bg-warning",        icon: Clock          },
  early_leave: { label: "Early Leave", bg: "bg-warning-tint",  text: "text-warning-strong",  dot: "bg-warning",        icon: LogOut         },
  half_day:    { label: "Half Day",    bg: "bg-info-soft",     text: "text-info",            dot: "bg-info",           icon: Coffee         },
  leave:       { label: "Leave",       bg: "bg-primary-soft",  text: "text-primary",         dot: "bg-primary",        icon: Plane          },
  holiday:     { label: "Holiday",     bg: "bg-accent-soft",   text: "text-accent-hover",    dot: "bg-accent",         icon: Sun            },
  absent:      { label: "Absent",      bg: "bg-danger-soft",   text: "text-danger",          dot: "bg-danger",         icon: AlertCircle    },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmtMinutes(mins: number | null): string {
  if (mins === null || mins === 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone: "success" | "danger" | "warning" | "info" | "primary" | "accent";
}) {
  const tones = {
    success: "border-success/20 bg-success-tint",
    danger:  "border-danger/20  bg-danger-soft",
    warning: "border-warning/20 bg-warning-tint",
    info:    "border-info/20    bg-info-soft",
    primary: "border-primary/20 bg-primary-soft",
    accent:  "border-accent/20  bg-accent-soft",
  };
  const textTones = {
    success: "text-success",
    danger:  "text-danger",
    warning: "text-warning-strong",
    info:    "text-info",
    primary: "text-primary",
    accent:  "text-accent-hover",
  };

  return (
    <div className={cn("rounded-card border p-3", tones[tone])}>
      <p className="overline text-ink-subtle">{label}</p>
      <p className={cn("tabular mt-1 text-metric font-bold", textTones[tone])}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-label text-ink-faint">{sub}</p>}
    </div>
  );
}

function DayCell({
  day,
  record,
  today,
  isCurrentMonth,
  onClick,
}: {
  day: number;
  record: AttendanceRecord | undefined;
  today: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}) {
  const cfg = record ? STATUS_CONFIG[record.status] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isCurrentMonth}
      className={cn(
        "relative flex h-12 w-full flex-col items-center justify-center gap-0.5",
        "rounded-control border transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-primary",
        !isCurrentMonth && "cursor-default opacity-30",
        today && "ring-2 ring-primary/40",
        cfg
          ? cn(cfg.bg, "border-transparent hover:shadow-sm")
          : isCurrentMonth
          ? "border-border bg-surface hover:border-border-muted hover:bg-surface-subtle"
          : "border-transparent bg-transparent",
      )}
      aria-label={
        record
          ? `${record.workDate}: ${STATUS_CONFIG[record.status].label}`
          : `${day} — no record`
      }
    >
      <span
        className={cn(
          "text-label font-semibold",
          cfg ? cfg.text : today ? "text-primary" : "text-ink-muted",
        )}
      >
        {day}
      </span>
      {cfg && (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", cfg.dot)}
        />
      )}
    </button>
  );
}

function RecordDrawer({
  record,
  onClose,
}: {
  record: AttendanceRecord | null;
  onClose: () => void;
}) {
  const open = record !== null;
  const cfg  = record ? STATUS_CONFIG[record.status] : null;
  const Icon = cfg?.icon ?? Clock;

  // Close on Escape
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Day attendance detail"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg",
          "rounded-t-2xl border border-border bg-surface shadow-2xl",
          "transition-transform duration-300 ease-[var(--ease-standard)]",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {record && cfg && (
          <div className="px-5 pb-8 pt-4">
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />

            {/* Status header */}
            <div className={cn("flex items-center gap-3 rounded-card px-4 py-3 mb-5", cfg.bg)}>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-surface/60", cfg.text)}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className={cn("text-h5 font-semibold", cfg.text)}>{cfg.label}</p>
                <p className="text-label text-ink-subtle">
                  {new Date(record.workDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Time row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-card border border-border bg-surface-subtle p-3">
                <p className="overline">Clock In</p>
                <p className="mt-1 flex items-center gap-1.5 text-h5 font-semibold text-ink">
                  <LogIn className="size-3.5 text-success" aria-hidden />
                  {fmtTime(record.clockIn)}
                </p>
              </div>
              <div className="rounded-card border border-border bg-surface-subtle p-3">
                <p className="overline">Clock Out</p>
                <p className="mt-1 flex items-center gap-1.5 text-h5 font-semibold text-ink">
                  <LogOut className="size-3.5 text-danger" aria-hidden />
                  {fmtTime(record.clockOut)}
                </p>
              </div>
            </div>

            {/* Hours row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-card border border-border bg-surface p-3 text-center">
                <p className="overline">Worked</p>
                <p className="tabular mt-1 text-body-sm font-semibold text-ink">
                  {fmtMinutes(record.workedMinutes)}
                </p>
              </div>
              <div className="rounded-card border border-border bg-surface p-3 text-center">
                <p className="overline">Scheduled</p>
                <p className="tabular mt-1 text-body-sm font-semibold text-ink">
                  {fmtMinutes(record.scheduledMinutes)}
                </p>
              </div>
              <div className="rounded-card border border-border bg-surface p-3 text-center">
                <p className="overline">Overtime</p>
                <p className={cn(
                  "tabular mt-1 text-body-sm font-semibold",
                  (record.overtimeMinutes ?? 0) > 0 ? "text-success" : "text-ink-faint",
                )}>
                  {fmtMinutes(record.overtimeMinutes)}
                </p>
              </div>
            </div>

            {/* Leave type */}
            {record.leaveType && (
              <div className="mb-4 rounded-card border border-primary/20 bg-primary-soft px-4 py-2.5">
                <p className="overline">Leave Type</p>
                <p className="mt-0.5 text-body-sm font-semibold capitalize text-primary">
                  {record.leaveType.replace("_", " ")} Leave
                </p>
              </div>
            )}

            {/* Admin note */}
            {record.adminNote && (
              <div className="rounded-card border border-warning/20 bg-warning-tint px-4 py-2.5">
                <p className="overline">Admin Note</p>
                <p className="mt-0.5 text-body-sm text-ink-muted">{record.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export interface TimesheetCalendarProps {
  /** All attendance records (should cover the displayed month) */
  records: AttendanceRecord[];
  /** Monthly summary totals */
  summary?: AttendanceSummary;
  /** Currently displayed month — "YYYY-MM" */
  month?: string;
  /** Called when user navigates to a different month */
  onMonthChange?: (month: string) => void;
  /** Loading state */
  loading?: boolean;
}

export function TimesheetCalendar({
  records,
  summary,
  month: monthProp,
  onMonthChange,
  loading = false,
}: TimesheetCalendarProps) {
  const today   = new Date();
  const todayYMD = today.toISOString().slice(0, 10);

  // ── Month navigation state ──────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = React.useState<string>(
    monthProp ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  );

  React.useEffect(() => {
    if (monthProp) setCurrentMonth(monthProp);
  }, [monthProp]);

  const [year, mon] = currentMonth.split("-").map(Number);
  const monthIndex  = mon - 1; // 0-based

  function navigate(dir: -1 | 1) {
    const d   = new Date(year, monthIndex + dir, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(next);
    onMonthChange?.(next);
  }

  // ── Build record lookup map ─────────────────────────────────────────
  const recordMap = React.useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of records) map.set(r.workDate, r);
    return map;
  }, [records]);

  // ── Selected day detail ─────────────────────────────────────────────
  const [selectedRecord, setSelectedRecord] = React.useState<AttendanceRecord | null>(null);

  // ── Calendar grid ───────────────────────────────────────────────────
  const daysInMonth   = getDaysInMonth(year, monthIndex);
  const firstDay      = getFirstDayOfMonth(year, monthIndex);
  const totalCells    = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ── Legend items ────────────────────────────────────────────────────
  const LEGEND: AttendanceStatus[] = [
    "present", "late", "early_leave", "half_day", "leave", "holiday", "absent",
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Summary stats ── */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Present"    value={summary.present}   tone="success" />
          <StatCard label="Absent"     value={summary.absent}    tone="danger"  />
          <StatCard label="Late"       value={summary.late}      tone="warning" />
          <StatCard label="Half Day"   value={summary.halfDay}   tone="info"    />
          <StatCard label="Leave"      value={summary.leave}     tone="primary" />
          <StatCard label="Holiday"    value={summary.holiday}   tone="accent"  />
          <StatCard
            label="Overtime"
            value={fmtMinutes(summary.totalOvertimeMinutes)}
            sub={`${fmtMinutes(summary.totalWorkedMinutes)} worked`}
            tone="success"
          />
        </div>
      )}

      {/* ── Calendar card ── */}
      <div className="rounded-card border border-border bg-surface shadow-card">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            <h2 className="text-h5 text-ink">{monthLabel}</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Previous month"
              className={cn(
                "grid size-8 place-items-center rounded-control",
                "border border-border text-ink-muted",
                "transition-colors hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
                setCurrentMonth(t);
                onMonthChange?.(t);
              }}
              className={cn(
                "px-3 h-8 rounded-control text-label font-semibold",
                "border border-border text-ink-muted",
                "transition-colors hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label="Next month"
              className={cn(
                "grid size-8 place-items-center rounded-control",
                "border border-border text-ink-muted",
                "transition-colors hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Day-of-week headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-center overline">
                {d}
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-control bg-surface-subtle"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Attendance calendar">
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayNum = i - firstDay + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
                const ymd    = isCurrentMonth ? toYMD(year, monthIndex, dayNum) : "";
                const record = isCurrentMonth ? recordMap.get(ymd) : undefined;
                const isToday = ymd === todayYMD;

                return (
                  <DayCell
                    key={i}
                    day={isCurrentMonth ? dayNum : 0}
                    record={record}
                    today={isToday}
                    isCurrentMonth={isCurrentMonth}
                    onClick={() => {
                      if (isCurrentMonth && record) setSelectedRecord(record);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
            {LEGEND.map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <span key={s} className="inline-flex items-center gap-1.5 text-label text-ink-subtle">
                  <span aria-hidden className={cn("size-2 rounded-full", cfg.dot)} />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Timesheet table ── */}
      <div className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <TrendingUp className="size-5 text-primary" aria-hidden />
          <h2 className="text-h5 text-ink">Timesheet</h2>
          <span className="ml-auto text-label text-ink-faint">
            {records.length} {records.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarDays className="size-10 text-ink-faint" aria-hidden />
            <p className="text-body-sm text-ink-subtle">No attendance records this month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]" aria-label="Timesheet table">
              <thead>
                <tr className="border-b border-border bg-surface-subtle">
                  {["Date", "Status", "Clock In", "Clock Out", "Worked", "Overtime"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left overline">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...records]
                  .sort((a, b) => b.workDate.localeCompare(a.workDate))
                  .map((r) => {
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-surface-subtle cursor-pointer"
                        onClick={() => setSelectedRecord(r)}
                      >
                        <td className="px-4 py-3 text-body-sm font-medium text-ink">
                          {new Date(r.workDate + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
                            "text-label font-semibold",
                            cfg.bg, cfg.text,
                          )}>
                            <span aria-hidden className={cn("size-1.5 rounded-full", cfg.dot)} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="tabular px-4 py-3 text-body-sm text-ink-muted">
                          {fmtTime(r.clockIn)}
                        </td>
                        <td className="tabular px-4 py-3 text-body-sm text-ink-muted">
                          {fmtTime(r.clockOut)}
                        </td>
                        <td className="tabular px-4 py-3 text-body-sm font-medium text-ink">
                          {fmtMinutes(r.workedMinutes)}
                        </td>
                        <td className={cn(
                          "tabular px-4 py-3 text-body-sm font-medium",
                          (r.overtimeMinutes ?? 0) > 0 ? "text-success" : "text-ink-faint",
                        )}>
                          {fmtMinutes(r.overtimeMinutes)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Day detail drawer ── */}
      <RecordDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}

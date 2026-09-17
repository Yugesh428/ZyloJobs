"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Types + constants                                                   */
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

export interface AttendanceJoinedWorker {
  id: string;
  fullName: string;
  email: string;
}

export interface AttendanceJoinedCompany {
  id: string;
  companyName: string;
  companyCode: string;
}

export interface Attendance {
  id: string;
  onboardingId: string;
  workerId: string;
  companyId: string;
  workDate: string;
  clockIn: string | null;
  clockOut: string | null;
  workedMinutes: number | null;
  overtimeMinutes: number | null;
  scheduledMinutes: number;
  status: AttendanceStatus;
  leaveType: LeaveType | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  // joined
  worker?: AttendanceJoinedWorker;
  company?: AttendanceJoinedCompany;
}

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    variant: "success" | "secondary" | "warning" | "destructive";
    statClass: string;
  }
> = {
  present: {
    label: "Present",
    variant: "success",
    statClass: "text-success",
  },
  absent: {
    label: "Absent",
    variant: "destructive",
    statClass: "text-destructive",
  },
  half_day: {
    label: "Half Day",
    variant: "warning",
    statClass: "text-amber-600",
  },
  leave: {
    label: "Leave",
    variant: "secondary",
    statClass: "text-blue-600",
  },
  holiday: {
    label: "Holiday",
    variant: "secondary",
    statClass: "text-purple-600",
  },
  late: {
    label: "Late",
    variant: "warning",
    statClass: "text-orange-600",
  },
  early_leave: {
    label: "Early Leave",
    variant: "warning",
    statClass: "text-yellow-600",
  },
};

export const LEAVE_TYPE_CONFIG: Record<LeaveType, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  unpaid: "Unpaid Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  other: "Other",
};

export const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = [
  "present",
  "absent",
  "half_day",
  "leave",
  "holiday",
  "late",
  "early_leave",
];

export const LEAVE_TYPE_OPTIONS: LeaveType[] = [
  "annual",
  "sick",
  "unpaid",
  "maternity",
  "paternity",
  "other",
];

export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/* ------------------------------------------------------------------ */
/* AttendanceStatsCards                                                */
/* ------------------------------------------------------------------ */

interface AttendanceStatsCardsProps {
  attendances: Attendance[];
}

export function AttendanceStatsCards({
  attendances,
}: AttendanceStatsCardsProps) {
  const stats = {
    total: attendances.length,
    present: attendances.filter((a) => a.status === "present").length,
    absent: attendances.filter((a) => a.status === "absent").length,
    half_day: attendances.filter((a) => a.status === "half_day").length,
    leave: attendances.filter((a) => a.status === "leave").length,
    holiday: attendances.filter((a) => a.status === "holiday").length,
    late: attendances.filter((a) => a.status === "late").length,
    early_leave: attendances.filter((a) => a.status === "early_leave").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.present.statClass}`}
          >
            Present
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.present}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.absent.statClass}`}
          >
            Absent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.absent}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.half_day.statClass}`}
          >
            Half Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.half_day}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.leave.statClass}`}
          >
            Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.leave}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.holiday.statClass}`}
          >
            Holiday
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.holiday}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.late.statClass}`}
          >
            Late
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.late}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ATTENDANCE_STATUS_CONFIG.early_leave.statClass}`}
          >
            Early Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.early_leave}</div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AttendanceFilters                                                   */
/* ------------------------------------------------------------------ */

interface AttendanceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
}

export function AttendanceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: AttendanceFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Attendance Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by worker name, company..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ATTENDANCE_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {ATTENDANCE_STATUS_CONFIG[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Label>From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label>To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* AttendanceTable                                                     */
/* ------------------------------------------------------------------ */

interface AttendanceTableProps {
  data: Attendance[];
  onView: (attendance: Attendance) => void;
  onEdit: (attendance: Attendance) => void;
  onDelete: (id: string) => void;
}

export function AttendanceTable({
  data,
  onView,
  onEdit,
  onDelete,
}: AttendanceTableProps) {
  const columns = [
    {
      header: "Worker",
      accessor: (row: Attendance) => (
        <div>
          <p className="font-medium">
            {row.worker?.fullName || shortId(row.workerId)}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.worker?.email || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Company",
      accessor: (row: Attendance) => (
        <p className="text-sm">
          {row.company?.companyName || shortId(row.companyId)}
        </p>
      ),
    },
    {
      header: "Date",
      accessor: (row: Attendance) => (
        <p className="text-sm">{new Date(row.workDate).toLocaleDateString()}</p>
      ),
    },
    {
      header: "Clock In",
      accessor: (row: Attendance) => (
        <p className="text-sm text-muted-foreground">{formatTime(row.clockIn)}</p>
      ),
    },
    {
      header: "Clock Out",
      accessor: (row: Attendance) => (
        <p className="text-sm text-muted-foreground">{formatTime(row.clockOut)}</p>
      ),
    },
    {
      header: "Worked",
      accessor: (row: Attendance) => (
        <p className="text-sm font-medium">{formatMinutes(row.workedMinutes)}</p>
      ),
    },
    {
      header: "Status",
      accessor: (row: Attendance) => {
        const meta = ATTENDANCE_STATUS_CONFIG[row.status];
        return <StatusBadge status={meta.label} variant={meta.variant} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: Attendance) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            title="Edit Attendance"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      emptyMessage="No attendance records found"
    />
  );
}

/* ------------------------------------------------------------------ */
/* AttendanceDetailsDialog                                             */
/* ------------------------------------------------------------------ */

interface AttendanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: Attendance | null;
  onEdit: (attendance: Attendance) => void;
}

export function AttendanceDetailsDialog({
  open,
  onOpenChange,
  attendance,
  onEdit,
}: AttendanceDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>Complete attendance record information</DialogDescription>
        </DialogHeader>

        {attendance && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Worker</Label>
                <p className="text-sm font-medium mt-1">
                  {attendance.worker?.fullName || shortId(attendance.workerId)}
                </p>
                {attendance.worker?.email && (
                  <p className="text-xs text-muted-foreground">
                    {attendance.worker.email}
                  </p>
                )}
              </div>
              <div>
                <Label>Company</Label>
                <p className="text-sm font-medium mt-1">
                  {attendance.company?.companyName || shortId(attendance.companyId)}
                </p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(attendance.workDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge
                    status={ATTENDANCE_STATUS_CONFIG[attendance.status].label}
                    variant={ATTENDANCE_STATUS_CONFIG[attendance.status].variant}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
              <div>
                <Label>Clock In</Label>
                <p className="text-sm font-medium mt-1">
                  {attendance.clockIn
                    ? new Date(attendance.clockIn).toLocaleString()
                    : "Not clocked in"}
                </p>
              </div>
              <div>
                <Label>Clock Out</Label>
                <p className="text-sm font-medium mt-1">
                  {attendance.clockOut
                    ? new Date(attendance.clockOut).toLocaleString()
                    : "Not clocked out"}
                </p>
              </div>
              <div>
                <Label>Worked Minutes</Label>
                <p className="text-sm font-medium mt-1">
                  {formatMinutes(attendance.workedMinutes)}
                </p>
              </div>
              <div>
                <Label>Overtime Minutes</Label>
                <p className="text-sm font-medium mt-1">
                  {formatMinutes(attendance.overtimeMinutes)}
                </p>
              </div>
              <div>
                <Label>Scheduled Minutes</Label>
                <p className="text-sm font-medium mt-1">
                  {formatMinutes(attendance.scheduledMinutes)}
                </p>
              </div>
              {attendance.leaveType && (
                <div>
                  <Label>Leave Type</Label>
                  <p className="text-sm font-medium mt-1">
                    {LEAVE_TYPE_CONFIG[attendance.leaveType]}
                  </p>
                </div>
              )}
            </div>

            {attendance.adminNote && (
              <div className="pt-2 border-t">
                <Label>Admin Note</Label>
                <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                  {attendance.adminNote}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
              <div>
                <Label>Created At</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(attendance.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(attendance.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {attendance && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(attendance);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Attendance
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* AttendanceForm                                                      */
/* ------------------------------------------------------------------ */

interface AttendanceFormData {
  // create-only
  onboardingId: string;
  workerId: string;
  companyId: string;
  workDate: string;
  // shared
  status: AttendanceStatus;
  scheduledMinutes: number;
  leaveType: LeaveType | null;
  clockIn: string;
  clockOut: string;
  adminNote: string;
}

interface AttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Partial<{
    id: string;
    onboardingId: string;
    workerId: string;
    companyId: string;
    workDate: string;
    status: AttendanceStatus;
    scheduledMinutes: number;
    leaveType: LeaveType | null;
    clockIn: string | null;
    clockOut: string | null;
    adminNote: string | null;
  }>;
  onSuccess: () => void;
}

const initialFormState: AttendanceFormData = {
  onboardingId: "",
  workerId: "",
  companyId: "",
  workDate: "",
  status: "present",
  scheduledMinutes: 480,
  leaveType: null,
  clockIn: "",
  clockOut: "",
  adminNote: "",
};

export function AttendanceForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSuccess,
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<AttendanceFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown data
  const [workers, setWorkers] = useState<
    Array<{ id: string; fullName: string; email: string }>
  >([]);
  const [companies, setCompanies] = useState<
    Array<{ id: string; companyName: string; industry: string }>
  >([]);
  const [onboardings, setOnboardings] = useState<
    Array<{
      id: string;
      worker?: { fullName: string };
      company?: { companyName: string };
      workerId: string;
      companyId: string;
    }>
  >([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (mode === "create" && open) {
        try {
          // Fetch onboardings (active workers)
          const onboardingsRes = await fetch("/api/onboarding?status=active&limit=200");
          const onboardingsData = await onboardingsRes.json();
          if (onboardingsData.success) setOnboardings(onboardingsData.data);

          // Fetch workers
          const workersRes = await fetch("/api/workers?limit=100");
          const workersData = await workersRes.json();
          if (workersData.success) setWorkers(workersData.data);

          // Fetch companies
          const companiesRes = await fetch("/api/companies?limit=100");
          const companiesData = await companiesRes.json();
          if (companiesData.success) setCompanies(companiesData.data);
        } catch (error) {
          console.error("Failed to fetch dropdown data:", error);
        }
      }
    };

    fetchDropdownData();
  }, [mode, open]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        onboardingId: initialData.onboardingId || "",
        workerId: initialData.workerId || "",
        companyId: initialData.companyId || "",
        workDate: initialData.workDate || "",
        status: initialData.status || "present",
        scheduledMinutes: initialData.scheduledMinutes ?? 480,
        leaveType: initialData.leaveType || null,
        clockIn: initialData.clockIn
          ? new Date(initialData.clockIn).toISOString().slice(0, 16)
          : "",
        clockOut: initialData.clockOut
          ? new Date(initialData.clockOut).toISOString().slice(0, 16)
          : "",
        adminNote: initialData.adminNote || "",
      });
    } else if (mode === "create") {
      setFormData({ ...initialFormState });
    }
    setError(null);
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/attendance"
          : `/api/attendance/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const payload: Record<string, unknown> =
        mode === "create"
          ? {
              onboardingId: formData.onboardingId.trim(),
              workerId: formData.workerId.trim(),
              companyId: formData.companyId.trim(),
              workDate: formData.workDate,
              status: formData.status,
              scheduledMinutes: Number(formData.scheduledMinutes),
              leaveType: formData.status === "leave" ? formData.leaveType : null,
              clockIn: formData.clockIn || null,
              clockOut: formData.clockOut || null,
              adminNote: formData.adminNote || null,
            }
          : {
              status: formData.status,
              scheduledMinutes: Number(formData.scheduledMinutes),
              leaveType: formData.status === "leave" ? formData.leaveType : null,
              clockIn: formData.clockIn || null,
              clockOut: formData.clockOut || null,
              adminNote: formData.adminNote || null,
            };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||
            (mode === "create"
              ? "Attendance created successfully!"
              : "Attendance updated successfully!")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        const errorMsg = data.error || `Failed to ${mode} attendance`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(`Failed to ${mode} attendance:`, err);
      const errorMsg = `Failed to ${mode} attendance. Please try again.`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Attendance" : "Edit Attendance"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a manual attendance record (leave, holiday, correction)."
              : "Update attendance record status and times."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {/* ── Create-only: Dropdowns ─────────────────────────────────── */}
          {mode === "create" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="onboardingId">
                  Onboarding (Worker) <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.onboardingId}
                  onValueChange={(value) => {
                    const onb = onboardings.find((o) => o.id === value);
                    setFormData({
                      ...formData,
                      onboardingId: value,
                      workerId: onb?.workerId || formData.workerId,
                      companyId: onb?.companyId || formData.companyId,
                    });
                  }}
                  disabled={loading}
                >
                  <SelectTrigger id="onboardingId">
                    <SelectValue placeholder="Select an active worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {onboardings.map((onb) => (
                      <SelectItem key={onb.id} value={onb.id}>
                        {onb.worker?.fullName || "Unknown Worker"} —{" "}
                        {onb.company?.companyName || "Unknown Company"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecting an onboarding will auto-fill Worker and Company
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workDate">
                  Work Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="workDate"
                  type="date"
                  value={formData.workDate}
                  onChange={(e) =>
                    setFormData({ ...formData, workDate: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledMinutes">
                  Scheduled Minutes <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scheduledMinutes"
                  type="number"
                  min={1}
                  value={formData.scheduledMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledMinutes: parseInt(e.target.value) || 480,
                    })
                  }
                  placeholder="480 (8 hours)"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* ── Shared: status + leave type ────────────────────── */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as AttendanceStatus,
                    leaveType: value === "leave" ? formData.leaveType : null,
                  })
                }
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {ATTENDANCE_STATUS_CONFIG[opt].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.status === "leave" && (
              <div className="space-y-2">
                <Label htmlFor="leaveType">
                  Leave Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.leaveType || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      leaveType: value as LeaveType,
                    })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {LEAVE_TYPE_CONFIG[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* ── Clock times (optional for create, editable for edit) ── */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clockIn">Clock In (optional)</Label>
              <Input
                id="clockIn"
                type="datetime-local"
                value={formData.clockIn}
                onChange={(e) =>
                  setFormData({ ...formData, clockIn: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clockOut">Clock Out (optional)</Label>
              <Input
                id="clockOut"
                type="datetime-local"
                value={formData.clockOut}
                onChange={(e) =>
                  setFormData({ ...formData, clockOut: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* ── Admin note ────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="adminNote">Admin Note</Label>
            <Input
              id="adminNote"
              value={formData.adminNote}
              onChange={(e) =>
                setFormData({ ...formData, adminNote: e.target.value })
              }
              placeholder="Correction reason or additional notes"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Attendance"
                  : "Update Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

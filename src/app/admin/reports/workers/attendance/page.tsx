"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Attendance {
  id: string;
  workDate: string;
  status: string;
  workedMinutes: number | null;
  overtimeMinutes: number | null;
  clockIn: string | null;
  clockOut: string | null;
  worker?: { fullName: string; email: string };
  company?: { companyName: string };
}

const STATUS_VARIANT: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  present: "success", absent: "destructive", half_day: "warning",
  leave: "secondary", holiday: "secondary", late: "warning", early_leave: "warning",
};

function fmt(min: number | null) {
  if (!min) return "—";
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default function WorkerAttendancePage() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/attendance?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(a => a.status === s).length;

  const columns = [
    { header: "Worker",   accessor: (r: Attendance) => <div><p className="font-medium">{r.worker?.fullName || "—"}</p><p className="text-xs text-muted-foreground">{r.worker?.email}</p></div> },
    { header: "Company",  accessor: (r: Attendance) => r.company?.companyName || "—" },
    { header: "Date",     accessor: (r: Attendance) => new Date(r.workDate).toLocaleDateString() },
    { header: "Clock In", accessor: (r: Attendance) => r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—" },
    { header: "Clock Out",accessor: (r: Attendance) => r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—" },
    { header: "Worked",   accessor: (r: Attendance) => fmt(r.workedMinutes) },
    { header: "Overtime", accessor: (r: Attendance) => fmt(r.overtimeMinutes) },
    { header: "Status",   accessor: (r: Attendance) => <StatusBadge status={r.status.replace("_", " ")} variant={STATUS_VARIANT[r.status] || "secondary"} /> },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Worker Attendance"
      description="Daily attendance records across all workers"
      stats={[
        { label: "Total Records", value: total },
        { label: "Present",       value: count("present") },
        { label: "Absent",        value: count("absent") },
        { label: "Leave",         value: count("leave") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No attendance records found" />
    </ReportShell>
  );
}

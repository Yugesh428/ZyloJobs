"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Interview { id: string; type: string; round: number; scheduledAt: string; status: string; location: string | null; worker?: { fullName: string; email: string }; job?: { jobRole: string }; }

const STATUS_VARIANT: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  scheduled: "secondary", completed: "success", cancelled: "destructive",
  no_show: "destructive", passed: "success", failed: "destructive",
};

export default function InterviewsReportPage() {
  const [data, setData] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/interviews?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(i => i.status === s).length;

  const columns = [
    { header: "Candidate",  accessor: (r: Interview) => <div><p className="font-medium">{r.worker?.fullName || "—"}</p><p className="text-xs text-muted-foreground">{r.worker?.email}</p></div> },
    { header: "Job Role",   accessor: (r: Interview) => r.job?.jobRole || "—" },
    { header: "Round",      accessor: (r: Interview) => `Round ${r.round}` },
    { header: "Type",       accessor: "type" as keyof Interview },
    { header: "Scheduled",  accessor: (r: Interview) => new Date(r.scheduledAt).toLocaleString() },
    { header: "Location",   accessor: (r: Interview) => r.location || "—" },
    { header: "Status",     accessor: (r: Interview) => <StatusBadge status={r.status} variant={STATUS_VARIANT[r.status] || "secondary"} /> },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Interviews"
      description="All interview rounds across all applications"
      stats={[
        { label: "Total",     value: total },
        { label: "Scheduled", value: count("scheduled") },
        { label: "Completed", value: count("completed") },
        { label: "Passed",    value: count("passed") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No interviews found" />
    </ReportShell>
  );
}

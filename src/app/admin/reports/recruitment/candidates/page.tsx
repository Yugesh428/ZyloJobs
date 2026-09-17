"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Application { id: string; status: string; appliedAt: string; cvUrl: string | null; worker?: { fullName: string; email: string }; job?: { jobRole: string; department: string }; }

const STATUS_VARIANT: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  pending: "warning", reviewing: "secondary", shortlisted: "secondary",
  hired: "success", rejected: "destructive", withdrawn: "secondary",
};

export default function CandidatesPage() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/applications?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(a => a.status === s).length;

  const columns = [
    { header: "Candidate", accessor: (r: Application) => <div><p className="font-medium">{r.worker?.fullName || "—"}</p><p className="text-xs text-muted-foreground">{r.worker?.email}</p></div> },
    { header: "Job Role",  accessor: (r: Application) => r.job?.jobRole || "—" },
    { header: "Dept",      accessor: (r: Application) => r.job?.department || "—" },
    { header: "CV",        accessor: (r: Application) => r.cvUrl ? <a href={r.cvUrl} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View</a> : "—" },
    { header: "Status",    accessor: (r: Application) => <StatusBadge status={r.status} variant={STATUS_VARIANT[r.status] || "secondary"} /> },
    { header: "Applied",   accessor: (r: Application) => new Date(r.appliedAt).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Candidates"
      description="All job applicants and their current status"
      stats={[
        { label: "Total",       value: total },
        { label: "Pending",     value: count("pending") },
        { label: "Shortlisted", value: count("shortlisted") },
        { label: "Hired",       value: count("hired") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No applications found" />
    </ReportShell>
  );
}

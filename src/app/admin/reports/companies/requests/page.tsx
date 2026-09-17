"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Request { id: string; jobRole: string; department: string; numberOfWorkers: number; status: string; workType: string; jobLocation: string; experienceRequired: string; createdAt: string; company?: { companyName: string }; }

export default function CompanyRequestsPage() {
  const [data, setData] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/worker-requests?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(r => r.status === s).length;
  const statusVariant = (s: string): "warning" | "secondary" | "success" | "destructive" =>
    s === "pending" ? "warning" : s === "processing" ? "secondary" : s === "fulfilled" ? "success" : "destructive";

  const columns = [
    { header: "Company",    accessor: (r: Request) => r.company?.companyName || "—" },
    { header: "Job Role",   accessor: "jobRole" as keyof Request },
    { header: "Department", accessor: "department" as keyof Request },
    { header: "# Workers",  accessor: "numberOfWorkers" as keyof Request },
    { header: "Location",   accessor: "jobLocation" as keyof Request },
    { header: "Work Type",  accessor: "workType" as keyof Request },
    { header: "Status",     accessor: (r: Request) => <StatusBadge status={r.status} variant={statusVariant(r.status)} /> },
    { header: "Date",       accessor: (r: Request) => new Date(r.createdAt).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Company Requests"
      description="All worker requests submitted by companies"
      stats={[
        { label: "Total",      value: total },
        { label: "Pending",    value: count("pending") },
        { label: "Processing", value: count("processing") },
        { label: "Fulfilled",  value: count("fulfilled") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No requests found" />
    </ReportShell>
  );
}

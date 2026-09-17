"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Request { id: string; jobRole: string; department: string; numberOfWorkers: number; status: string; workType: string; jobLocation: string; experienceRequired: string; createdAt: string; company?: { companyName: string; industry: string }; }

export default function PendingRequestsPage() {
  const [data, setData] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/worker-requests?status=pending&limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalWorkers = data.reduce((s, r) => s + r.numberOfWorkers, 0);

  const columns = [
    { header: "Company",     accessor: (r: Request) => <div><p className="font-medium">{r.company?.companyName || "—"}</p><p className="text-xs text-muted-foreground">{r.company?.industry}</p></div> },
    { header: "Role",        accessor: "jobRole" as keyof Request },
    { header: "Department",  accessor: "department" as keyof Request },
    { header: "# Workers",   accessor: "numberOfWorkers" as keyof Request },
    { header: "Experience",  accessor: "experienceRequired" as keyof Request },
    { header: "Location",    accessor: "jobLocation" as keyof Request },
    { header: "Work Type",   accessor: "workType" as keyof Request },
    { header: "Submitted",   accessor: (r: Request) => new Date(r.createdAt).toLocaleDateString() },
    { header: "Status",      accessor: (r: Request) => <StatusBadge status={r.status} variant="warning" /> },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Pending Requests"
      description="Worker requests awaiting action"
      stats={[
        { label: "Pending Requests", value: data.length },
        { label: "Workers Needed",   value: totalWorkers },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No pending requests" />
    </ReportShell>
  );
}

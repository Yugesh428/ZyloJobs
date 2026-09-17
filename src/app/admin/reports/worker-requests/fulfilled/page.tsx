"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Request { id: string; jobRole: string; department: string; numberOfWorkers: number; status: string; workType: string; createdAt: string; updatedAt: string; company?: { companyName: string }; }

export default function FulfilledRequestsPage() {
  const [data, setData] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/worker-requests?status=fulfilled&limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalWorkers = data.reduce((s, r) => s + r.numberOfWorkers, 0);

  const columns = [
    { header: "Company",     accessor: (r: Request) => r.company?.companyName || "—" },
    { header: "Role",        accessor: "jobRole" as keyof Request },
    { header: "Department",  accessor: "department" as keyof Request },
    { header: "# Workers",   accessor: "numberOfWorkers" as keyof Request },
    { header: "Work Type",   accessor: "workType" as keyof Request },
    { header: "Requested",   accessor: (r: Request) => new Date(r.createdAt).toLocaleDateString() },
    { header: "Fulfilled On",accessor: (r: Request) => new Date(r.updatedAt).toLocaleDateString() },
    { header: "Status",      accessor: (r: Request) => <StatusBadge status="Fulfilled" variant="success" /> },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Fulfilled Requests"
      description="Successfully completed worker requests"
      stats={[
        { label: "Fulfilled Requests", value: data.length },
        { label: "Workers Placed",     value: totalWorkers },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No fulfilled requests" />
    </ReportShell>
  );
}

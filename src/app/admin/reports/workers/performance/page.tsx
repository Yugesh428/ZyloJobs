"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Onboarding {
  id: string;
  workerId: string;
  status: string;
  salaryAmount: number;
  salaryPeriod: string;
  joiningDate: string;
  worker?: { fullName: string; email: string; jobCategory: string };
  company?: { companyName: string };
  job?: { jobRole: string };
}

export default function WorkerPerformancePage() {
  const [data, setData] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/onboarding?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(o => o.status === s).length;

  const columns = [
    { header: "Worker",    accessor: (r: Onboarding) => <div><p className="font-medium">{r.worker?.fullName || r.workerId.slice(0,8)}</p><p className="text-xs text-muted-foreground">{r.worker?.email}</p></div> },
    { header: "Job Role",  accessor: (r: Onboarding) => r.job?.jobRole || "—" },
    { header: "Company",   accessor: (r: Onboarding) => r.company?.companyName || "—" },
    { header: "Salary",    accessor: (r: Onboarding) => `Rs. ${r.salaryAmount.toLocaleString()}/${r.salaryPeriod.slice(0,2)}` },
    { header: "Status",    accessor: (r: Onboarding) => <StatusBadge status={r.status} variant={r.status === "active" ? "success" : r.status === "terminated" ? "destructive" : "secondary"} /> },
    { header: "Joining",   accessor: (r: Onboarding) => new Date(r.joiningDate).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Worker Performance"
      description="Onboarding status and placement performance of workers"
      stats={[
        { label: "Total Placements", value: total },
        { label: "Active",           value: count("active") },
        { label: "Terminated",       value: count("terminated") },
        { label: "Pending",          value: count("pending") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No placement data found" />
    </ReportShell>
  );
}

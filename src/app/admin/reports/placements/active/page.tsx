"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";

interface Onboarding { id: string; joiningDate: string; salaryAmount: number; salaryPeriod: string; worker?: { fullName: string; email: string }; company?: { companyName: string; industry: string }; job?: { jobRole: string; department: string }; }

export default function ActivePlacementsPage() {
  const [data, setData] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/onboarding?status=active&limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const avgSalary = data.length ? Math.round(data.reduce((s, o) => s + o.salaryAmount, 0) / data.length) : 0;

  const columns = [
    { header: "Worker",   accessor: (r: Onboarding) => <div><p className="font-medium">{r.worker?.fullName || "—"}</p><p className="text-xs text-muted-foreground">{r.worker?.email}</p></div> },
    { header: "Company",  accessor: (r: Onboarding) => <div><p className="font-medium">{r.company?.companyName || "—"}</p><p className="text-xs text-muted-foreground">{r.company?.industry}</p></div> },
    { header: "Role",     accessor: (r: Onboarding) => r.job?.jobRole || "—" },
    { header: "Dept",     accessor: (r: Onboarding) => r.job?.department || "—" },
    { header: "Salary",   accessor: (r: Onboarding) => `Rs. ${r.salaryAmount.toLocaleString()}/${r.salaryPeriod.slice(0,2)}` },
    { header: "Since",    accessor: (r: Onboarding) => new Date(r.joiningDate).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Active Placements"
      description="Workers currently active at companies"
      stats={[
        { label: "Active Placements", value: total },
        { label: "Avg Salary (NPR)",  value: `Rs. ${avgSalary.toLocaleString()}`, sub: "per period" },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No active placements" />
    </ReportShell>
  );
}

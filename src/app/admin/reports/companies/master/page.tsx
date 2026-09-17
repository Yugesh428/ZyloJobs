"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Company { id: string; companyName: string; companyCode: string; companyType: string; industry: string; email: string; status: string; createdAt: string; }

export default function CompanyMasterPage() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/companies?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(c => c.status === s).length;

  const columns = [
    { header: "Company",  accessor: (r: Company) => <div><p className="font-medium">{r.companyName}</p><p className="text-xs text-muted-foreground">{r.companyCode}</p></div> },
    { header: "Type",     accessor: "companyType" as keyof Company },
    { header: "Industry", accessor: "industry" as keyof Company },
    { header: "Email",    accessor: "email" as keyof Company },
    { header: "Status",   accessor: (r: Company) => <StatusBadge status={r.status} variant={r.status === "active" ? "success" : r.status === "pending" ? "warning" : "destructive"} /> },
    { header: "Joined",   accessor: (r: Company) => new Date(r.createdAt).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Company Master"
      description="Complete directory of all registered companies"
      stats={[
        { label: "Total",     value: total },
        { label: "Active",    value: count("active") },
        { label: "Pending",   value: count("pending") },
        { label: "Suspended", value: count("suspended") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No companies found" />
    </ReportShell>
  );
}

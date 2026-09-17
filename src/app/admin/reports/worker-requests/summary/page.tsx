"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Request { id: string; jobRole: string; department: string; numberOfWorkers: number; status: string; workType: string; createdAt: string; company?: { companyName: string }; }

export default function RequestSummaryPage() {
  const [data, setData] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/worker-requests?limit=200")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(r => r.status === s).length;
  const totalWorkers = data.reduce((sum, r) => sum + r.numberOfWorkers, 0);
  const statusV = (s: string): "warning" | "secondary" | "success" | "destructive" =>
    s === "pending" ? "warning" : s === "processing" ? "secondary" : s === "fulfilled" ? "success" : "destructive";

  const byType = data.reduce((acc, r) => { acc[r.workType] = (acc[r.workType] || 0) + 1; return acc; }, {} as Record<string, number>);

  const columns = [
    { header: "Company",    accessor: (r: Request) => r.company?.companyName || "—" },
    { header: "Role",       accessor: "jobRole" as keyof Request },
    { header: "Dept",       accessor: "department" as keyof Request },
    { header: "# Needed",   accessor: "numberOfWorkers" as keyof Request },
    { header: "Work Type",  accessor: "workType" as keyof Request },
    { header: "Status",     accessor: (r: Request) => <StatusBadge status={r.status} variant={statusV(r.status)} /> },
    { header: "Date",       accessor: (r: Request) => new Date(r.createdAt).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Request Summary"
      description="Aggregated overview of all worker requests"
      stats={[
        { label: "Total Requests",    value: total },
        { label: "Workers Requested", value: totalWorkers },
        { label: "Pending",           value: count("pending") },
        { label: "Fulfilled",         value: count("fulfilled") },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {Object.entries(byType).map(([type, n]) => (
          <Card key={type}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{type}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground">requests</p></CardContent>
          </Card>
        ))}
      </div>
      <DataTable data={data} columns={columns} emptyMessage="No requests found" />
    </ReportShell>
  );
}

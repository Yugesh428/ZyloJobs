"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Worker { id: string; fullName: string; email: string; jobCategory: string; status: string; availability: string; location: string; createdAt: string; }

export default function WorkerStatusPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/workers?limit=100")
      .then(r => r.json())
      .then(d => { if (d.success) { setWorkers(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (field: keyof Worker, val: string) => workers.filter(w => w[field] === val).length;

  const statusVariant = (s: string) => s === "active" ? "success" : s === "inactive" ? "secondary" : "destructive";
  const availVariant  = (s: string) => s === "available" ? "success" : s === "busy" ? "warning" : "secondary";

  const columns = [
    { header: "Worker",       accessor: (r: Worker) => <div><p className="font-medium">{r.fullName}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
    { header: "Category",     accessor: "jobCategory" as keyof Worker },
    { header: "Location",     accessor: "location" as keyof Worker },
    { header: "Status",       accessor: (r: Worker) => <StatusBadge status={r.status} variant={statusVariant(r.status)} /> },
    { header: "Availability", accessor: (r: Worker) => <StatusBadge status={r.availability} variant={availVariant(r.availability)} /> },
    { header: "Joined",       accessor: (r: Worker) => new Date(r.createdAt).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Worker Status"
      description="Current status and availability of all workers"
      stats={[
        { label: "Total",     value: total },
        { label: "Active",    value: count("status", "active") },
        { label: "Inactive",  value: count("status", "inactive") },
        { label: "Available", value: count("availability", "available") },
      ]}
    >
      <DataTable data={workers} columns={columns} emptyMessage="No workers found" />
    </ReportShell>
  );
}

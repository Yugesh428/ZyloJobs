"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Worker {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobCategory: string;
  experienceYears: number;
  status: string;
  availability: string;
  createdAt: string;
}

export default function WorkerMasterPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/workers?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setWorkers(d.data); setTotal(d.pagination.total); }
      })
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (s: string) => workers.filter((w) => w.status === s).length;

  const columns = [
    { header: "Name",       accessor: (r: Worker) => <div><p className="font-medium">{r.fullName}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
    { header: "Category",   accessor: "jobCategory" as keyof Worker },
    { header: "Location",   accessor: "location"    as keyof Worker },
    { header: "Experience", accessor: (r: Worker) => `${r.experienceYears} yrs` },
    { header: "Status",     accessor: (r: Worker) => <StatusBadge status={r.status} variant={r.status === "active" ? "success" : r.status === "inactive" ? "secondary" : "warning"} /> },
    { header: "Availability", accessor: "availability" as keyof Worker },
    { header: "Joined",     accessor: (r: Worker) => new Date(r.createdAt).toLocaleDateString() },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Worker Master"
      description="Complete directory of all registered workers"
      stats={[
        { label: "Total Workers", value: total },
        { label: "Active",        value: byStatus("active") },
        { label: "Inactive",      value: byStatus("inactive") },
        { label: "Suspended",     value: byStatus("suspended") },
      ]}
    >
      <DataTable data={workers} columns={columns} emptyMessage="No workers found" />
    </ReportShell>
  );
}

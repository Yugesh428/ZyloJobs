"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkerComplaint { id: string; title: string; category: string; severity: string; status: string; createdAt: string; company?: { companyName: string }; worker?: { fullName: string; email: string }; }
interface CompanyComplaint { id: string; title: string; category: string; severity: string; status: string; isAnonymous: boolean; createdAt: string; company?: { companyName: string }; worker?: { fullName: string; email: string } | null; }

const SEV: Record<string, "destructive"|"warning"|"secondary"> = { critical:"destructive", high:"destructive", medium:"warning", low:"secondary" };
const STA: Record<string, "warning"|"secondary"|"success"|"destructive"> = { open:"warning", under_review:"secondary", resolved:"success", dismissed:"destructive" };

export default function IssuesComplaintsPage() {
  const [wc, setWc] = useState<WorkerComplaint[]>([]);
  const [cc, setCc] = useState<CompanyComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/worker-complaints?limit=100").then(r => r.json()),
      fetch("/api/company-complaints?limit=100&asAdmin=true").then(r => r.json()),
    ]).then(([wd, cd]) => {
      if (wd.success) setWc(wd.data);
      if (cd.success) setCc(cd.data);
    }).finally(() => setLoading(false));
  }, []);

  const wcCols = [
    { header: "Filed By",  accessor: (r: WorkerComplaint) => r.company?.companyName || "—" },
    { header: "Against",   accessor: (r: WorkerComplaint) => <div><p className="font-medium">{r.worker?.fullName || "—"}</p><p className="text-xs text-muted-foreground">{r.worker?.email}</p></div> },
    { header: "Title",     accessor: (r: WorkerComplaint) => <p className="text-sm line-clamp-1">{r.title}</p> },
    { header: "Category",  accessor: (r: WorkerComplaint) => r.category.replace("_", " ") },
    { header: "Severity",  accessor: (r: WorkerComplaint) => <StatusBadge status={r.severity} variant={SEV[r.severity]} /> },
    { header: "Status",    accessor: (r: WorkerComplaint) => <StatusBadge status={r.status.replace("_"," ")} variant={STA[r.status]} /> },
    { header: "Date",      accessor: (r: WorkerComplaint) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const ccCols = [
    { header: "Filed By",  accessor: (r: CompanyComplaint) => r.worker ? <div><p className="font-medium">{r.worker.fullName}</p><p className="text-xs text-muted-foreground">{r.worker.email}</p></div> : <span className="italic text-muted-foreground text-sm">🔒 Anonymous</span> },
    { header: "Against",   accessor: (r: CompanyComplaint) => r.company?.companyName || "—" },
    { header: "Title",     accessor: (r: CompanyComplaint) => <p className="text-sm line-clamp-1">{r.title}</p> },
    { header: "Category",  accessor: (r: CompanyComplaint) => r.category.replace("_", " ") },
    { header: "Severity",  accessor: (r: CompanyComplaint) => <StatusBadge status={r.severity} variant={SEV[r.severity]} /> },
    { header: "Status",    accessor: (r: CompanyComplaint) => <StatusBadge status={r.status.replace("_"," ")} variant={STA[r.status]} /> },
    { header: "Date",      accessor: (r: CompanyComplaint) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const countW = (s: string) => wc.filter(c => c.status === s).length;
  const countC = (s: string) => cc.filter(c => c.status === s).length;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Issues & Complaints"
      description="All complaints — companies against workers, and workers against companies"
      stats={[
        { label: "Total Complaints",        value: wc.length + cc.length },
        { label: "Against Workers (Open)",  value: countW("open") },
        { label: "Against Companies (Open)",value: countC("open") },
        { label: "Resolved",                value: countW("resolved") + countC("resolved") },
      ]}
    >
      <Tabs defaultValue="against-workers">
        <TabsList>
          <TabsTrigger value="against-workers">Against Workers ({wc.length})</TabsTrigger>
          <TabsTrigger value="against-companies">Against Companies ({cc.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="against-workers" className="mt-4">
          <DataTable data={wc} columns={wcCols} emptyMessage="No complaints against workers" />
        </TabsContent>
        <TabsContent value="against-companies" className="mt-4">
          <DataTable data={cc} columns={ccCols} emptyMessage="No complaints against companies" />
        </TabsContent>
      </Tabs>
    </ReportShell>
  );
}

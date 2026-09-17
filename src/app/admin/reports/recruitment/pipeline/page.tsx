"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Application { status: string; }

const STAGES = [
  { key: "pending",     label: "Applied",     color: "bg-amber-500" },
  { key: "reviewing",   label: "Reviewing",   color: "bg-blue-500" },
  { key: "shortlisted", label: "Shortlisted", color: "bg-purple-500" },
  { key: "hired",       label: "Hired",       color: "bg-green-500" },
  { key: "rejected",    label: "Rejected",    color: "bg-red-500" },
];

export default function RecruitmentPipelinePage() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/applications?limit=200")
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.pagination.total); } })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter(a => a.status === s).length;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <ReportShell
      title="Recruitment Pipeline"
      description="Visual breakdown of candidates at each recruitment stage"
      stats={[
        { label: "Total Applications", value: total },
        { label: "Conversion Rate",    value: total ? `${Math.round((count("hired") / total) * 100)}%` : "0%", sub: "Applications to hires" },
        { label: "Hired",    value: count("hired") },
        { label: "Rejected", value: count("rejected") },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-5">
        {STAGES.map((stage) => {
          const n = count(stage.key);
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <Card key={stage.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{n}</p>
                <p className="text-xs text-muted-foreground mt-1">{pct}% of total</p>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ReportShell>
  );
}

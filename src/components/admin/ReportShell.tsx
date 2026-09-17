"use client";

import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
}

interface ReportShellProps {
  title: string;
  description: string;
  backHref?: string;
  stats?: Stat[];
  children?: React.ReactNode;
}

export function ReportShell({
  title,
  description,
  backHref = "/admin/reports",
  stats,
  children,
}: ReportShellProps) {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        }
      />

      {stats && stats.length > 0 && (
        <div className={`grid gap-4 md:grid-cols-${Math.min(stats.length, 4)}`}>
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
                {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {children ?? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Report Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This report will pull live data from the database and display charts, tables, and export options.
          </p>
        </div>
      )}
    </div>
  );
}

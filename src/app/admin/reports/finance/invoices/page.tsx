"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Payroll {
  id: string;
  salaryAmount: number;
  paymentStatus: string;
  paymentDate: string | null;
  salaryPeriod: string;
  createdAt: string;
  worker?: { fullName: string; email: string };
  company?: { companyName: string };
}

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
  processing: "secondary",
};

export default function InvoicesPage() {
  const [data, setData] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/payroll?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data);
          setTotal(d.pagination.total);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => data.filter((p) => p.paymentStatus === s).length;
  const totalAmount = data.reduce((s, p) => s + p.salaryAmount, 0);

  const columns = [
    {
      header: "Invoice ID",
      accessor: (r: Payroll) => (
        <p className="font-mono text-xs">{r.id.slice(0, 12)}...</p>
      ),
    },
    {
      header: "Worker",
      accessor: (r: Payroll) => (
        <div>
          <p className="font-medium">{r.worker?.fullName || "—"}</p>
          <p className="text-xs text-muted-foreground">{r.worker?.email}</p>
        </div>
      ),
    },
    {
      header: "Company",
      accessor: (r: Payroll) => r.company?.companyName || "—",
    },
    {
      header: "Amount",
      accessor: (r: Payroll) => (
        <p className="font-medium text-right">
          Rs. {r.salaryAmount.toLocaleString()}
        </p>
      ),
    },
    {
      header: "Period",
      accessor: (r: Payroll) => r.salaryPeriod || "—",
    },
    {
      header: "Status",
      accessor: (r: Payroll) => (
        <StatusBadge
          status={r.paymentStatus}
          variant={STATUS_VARIANT[r.paymentStatus] || "secondary"}
        />
      ),
    },
    {
      header: "Payment Date",
      accessor: (r: Payroll) =>
        r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : "—",
    },
    {
      header: "Issued",
      accessor: (r: Payroll) => new Date(r.createdAt).toLocaleDateString(),
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );

  return (
    <ReportShell
      title="Invoices"
      description="All payroll invoices and their payment status"
      stats={[
        { label: "Total Invoices", value: total },
        { label: "Total Amount", value: `Rs. ${totalAmount.toLocaleString()}` },
        { label: "Paid", value: count("paid") },
        { label: "Pending", value: count("pending") },
      ]}
    >
      <DataTable data={data} columns={columns} emptyMessage="No invoices found" />
    </ReportShell>
  );
}

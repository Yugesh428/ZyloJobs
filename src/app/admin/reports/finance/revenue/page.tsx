"use client";

import { useEffect, useState } from "react";
import { ReportShell } from "@/components/admin/ReportShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/admin/DataTable";

interface Payroll {
  id: string;
  salaryAmount: number;
  paymentStatus: string;
  paymentDate: string | null;
  createdAt: string;
  worker?: { fullName: string; email: string };
  company?: { companyName: string };
}

export default function RevenuePage() {
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

  const totalRevenue = data
    .filter((p) => p.paymentStatus === "paid")
    .reduce((s, p) => s + p.salaryAmount, 0);
  const pending = data
    .filter((p) => p.paymentStatus === "pending")
    .reduce((s, p) => s + p.salaryAmount, 0);
  const paid = data.filter((p) => p.paymentStatus === "paid").length;
  const unpaid = data.filter((p) => p.paymentStatus !== "paid").length;

  const columns = [
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
        <p className="font-medium">Rs. {r.salaryAmount.toLocaleString()}</p>
      ),
    },
    {
      header: "Status",
      accessor: (r: Payroll) => (
        <span
          className={`text-xs font-medium ${
            r.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"
          }`}
        >
          {r.paymentStatus}
        </span>
      ),
    },
    {
      header: "Paid On",
      accessor: (r: Payroll) =>
        r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : "—",
    },
    {
      header: "Created",
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
      title="Revenue"
      description="Payroll transactions and revenue tracking"
      stats={[
        {
          label: "Total Revenue (Paid)",
          value: `Rs. ${totalRevenue.toLocaleString()}`,
        },
        { label: "Pending", value: `Rs. ${pending.toLocaleString()}` },
        { label: "Paid Transactions", value: paid },
        { label: "Unpaid Transactions", value: unpaid },
      ]}
    >
      <DataTable
        data={data}
        columns={columns}
        emptyMessage="No payroll records found"
      />
    </ReportShell>
  );
}

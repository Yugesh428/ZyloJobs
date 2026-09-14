"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export default function PayrollPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Payroll Management"
        description="Manage worker payments and company invoices"
        action={
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Process Payroll
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Payroll management page - Ready for implementation
      </div>
    </div>
  );
}

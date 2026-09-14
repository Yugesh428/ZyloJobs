"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Attendance Management"
        description="Track and manage worker attendance records"
        action={
          <Button>
            <Clock className="mr-2 h-4 w-4" />
            Export Attendance
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Attendance management page - Ready for implementation
      </div>
    </div>
  );
}

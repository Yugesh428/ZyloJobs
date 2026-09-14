"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function ComplaintsPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Complaints Management"
        description="Handle complaints from workers and companies"
        action={
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Filter Complaints
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Complaints management page - Ready for implementation
      </div>
    </div>
  );
}

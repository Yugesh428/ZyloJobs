"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function WorkersPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Workers Management"
        description="Manage all registered workers on the platform"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Workers management page - Ready for implementation
      </div>
    </div>
  );
}

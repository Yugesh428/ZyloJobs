"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Support Tickets"
        description="Manage support tickets from workers and companies"
        action={
          <Button>
            <HelpCircle className="mr-2 h-4 w-4" />
            View All Tickets
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Support tickets page - Ready for implementation
      </div>
    </div>
  );
}

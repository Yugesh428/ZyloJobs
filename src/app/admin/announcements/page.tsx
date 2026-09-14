"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Announcements"
        description="Create and manage platform-wide announcements"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Announcements page - Ready for implementation
      </div>
    </div>
  );
}

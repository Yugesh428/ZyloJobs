"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Settings"
        description="Configure platform settings and preferences"
        action={
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        }
      />
      
      <div className="text-center py-12 text-muted-foreground">
        Settings page - Ready for implementation
      </div>
    </div>
  );
}

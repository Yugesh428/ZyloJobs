"use client";

import { PageHeader } from "@/components/company/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Settings"
        description="Manage your company profile and preferences"
      />
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Settings coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

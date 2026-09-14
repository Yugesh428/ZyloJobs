"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "destructive" | "secondary" | "outline";
}

export function StatusBadge({ status, variant = "secondary" }: StatusBadgeProps) {
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

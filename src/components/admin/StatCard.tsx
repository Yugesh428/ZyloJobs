"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBgColor = "bg-primary-soft",
  iconColor = "text-primary",
}: StatCardProps) {
  const changeColors = {
    increase: "text-success",
    decrease: "text-danger",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <div className={`${iconBgColor} ${iconColor} p-2.5 rounded-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-3xl font-bold tracking-tight tabular">{value}</h3>
        {change && (
          <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

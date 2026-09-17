"use client";

import Link from "next/link";
import {
  Users, Building2, Calendar, ClipboardList,
  UserCheck, MessageSquare, DollarSign, Activity,
  TrendingUp, Clock, Layers, Receipt, ShieldCheck, FileText,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Workers",
    description: "Worker profiles, status, performance and attendance",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Users,
    links: [
      { label: "Worker Master",      href: "/admin/reports/workers/master" },
      { label: "Worker Status",      href: "/admin/reports/workers/status" },
      { label: "Worker Performance", href: "/admin/reports/workers/performance" },
      { label: "Worker Attendance",  href: "/admin/reports/workers/attendance" },
    ],
  },
  {
    title: "Companies",
    description: "Company directory, requests, and workforce",
    color: "text-purple-600",
    bg: "bg-purple-50",
    icon: Building2,
    links: [
      { label: "Company Master",   href: "/admin/reports/companies/master" },
      { label: "Company Requests", href: "/admin/reports/companies/requests" },
      { label: "Company Workers",  href: "/admin/reports/companies/workers" },
    ],
  },
  {
    title: "Recruitment",
    description: "Interviews, candidates and pipeline analytics",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: Calendar,
    links: [
      { label: "Interviews",             href: "/admin/reports/recruitment/interviews" },
      { label: "Candidates",             href: "/admin/reports/recruitment/candidates" },
      { label: "Recruitment Pipeline",   href: "/admin/reports/recruitment/pipeline" },
    ],
  },
  {
    title: "Worker Requests",
    description: "Demand analysis and request fulfillment",
    color: "text-orange-600",
    bg: "bg-orange-50",
    icon: ClipboardList,
    links: [
      { label: "Request Summary",    href: "/admin/reports/worker-requests/summary" },
      { label: "Pending Requests",   href: "/admin/reports/worker-requests/pending" },
      { label: "Fulfilled Requests", href: "/admin/reports/worker-requests/fulfilled" },
    ],
  },
  {
    title: "Placements",
    description: "Active and historical worker placements",
    color: "text-teal-600",
    bg: "bg-teal-50",
    icon: UserCheck,
    links: [
      { label: "Active Placements",  href: "/admin/reports/placements/active" },
      { label: "Placement History",  href: "/admin/reports/placements/history" },
    ],
  },
  {
    title: "Performance",
    description: "Worker performance, feedback and complaints",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: TrendingUp,
    links: [
      { label: "Issues & Complaints", href: "/admin/reports/performance/complaints" },
    ],
  },
  {
    title: "Finance",
    description: "Revenue, invoices and payment tracking",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: DollarSign,
    links: [
      { label: "Revenue",  href: "/admin/reports/finance/revenue" },
      { label: "Invoices", href: "/admin/reports/finance/invoices" },
    ],
  },
  {
    title: "System",
    description: "Admin activity and audit logs",
    color: "text-gray-600",
    bg: "bg-gray-50",
    icon: Activity,
    links: [
      { label: "Admin Activity", href: "/admin/reports/system/activity" },
      { label: "Audit Logs",     href: "/admin/reports/system/audit" },
    ],
  },
];

export default function ReportsOverviewPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Reports"
        description="Analytics and insights across workers, companies, recruitment, finance and system activity"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className={`inline-flex p-2 rounded-lg ${section.bg} w-fit mb-2`}>
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription className="text-xs">{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary hover:underline py-0.5 transition-colors"
                  >
                    → {link.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

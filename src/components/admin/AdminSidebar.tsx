"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  Calendar,
  UserCheck,
  Clock,
  DollarSign,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Management",
    icon: Building2,
    children: [
      { title: "Companies", href: "/admin/companies", icon: Building2 },
      { title: "Workers", href: "/admin/workers", icon: Users },
      { title: "Job Categories", href: "/admin/job-categories", icon: Briefcase },
      { title: "Jobs", href: "/admin/jobs", icon: Briefcase },
    ],
  },
  {
    title: "Recruitment",
    icon: FileText,
    children: [
      { title: "Applications", href: "/admin/applications", icon: FileText, badge: "12" },
      { title: "Interviews", href: "/admin/interviews", icon: Calendar },
      { title: "Onboarding", href: "/admin/onboarding", icon: UserCheck },
    ],
  },
  {
    title: "Operations",
    icon: Clock,
    children: [
      { title: "Attendance", href: "/admin/attendance", icon: Clock },
      { title: "Payroll", href: "/admin/payroll", icon: DollarSign },
    ],
  },
  {
    title: "Support",
    icon: HelpCircle,
    children: [
      { title: "Complaints", href: "/admin/complaints", icon: MessageSquare },
      { title: "Support Tickets", href: "/admin/support", icon: HelpCircle },
    ],
  },
  {
    title: "Communication",
    icon: Megaphone,
    children: [
      { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Management: true,
    Recruitment: true,
    Operations: true,
    Support: false,
    Communication: false,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface border-r border-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold text-primary">ZYLO</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSections[item.title];
          
          // Single item (no children)
          if (!item.children) {
            const isActive = pathname === item.href;
            return (
              <Link key={item.title} href={item.href!} className="no-underline">
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:underline hover:decoration-1",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-soft text-primary">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          }

          // Section with children
          return (
            <div key={item.title}>
              <button
                onClick={() => !collapsed && toggleSection(item.title)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  "text-muted-foreground hover:underline hover:decoration-1",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </>
                )}
              </button>

              {/* Children */}
              {!collapsed && isExpanded && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-2">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isActive = pathname === child.href;
                    
                    return (
                      <Link key={child.href} href={child.href!} className="no-underline">
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:underline hover:decoration-1"
                          )}
                        >
                          <ChildIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{child.title}</span>
                          {child.badge && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-soft text-primary">
                              {child.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        <Link href="/admin/settings" className="no-underline">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/admin/settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:underline hover:decoration-1",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="flex-1">Settings</span>}
          </div>
        </Link>

        <button
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
            "text-destructive hover:underline hover:decoration-1",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

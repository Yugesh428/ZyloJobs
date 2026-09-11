"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  ClipboardList,
  FileText,
  Building2,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  BellRing,
  UserCog,
  History,
  MessageSquare,
  Bell,
  LifeBuoy,
  Receipt,
  Wallet,
  CreditCard,
  FileCheck,
  UserPlus,
  TrendingUp,
  Clock,
  AlertCircle,
  Home,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

const NAV_STRUCTURE: NavItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    children: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    ],
  },
  {
    label: "Staffing",
    icon: Briefcase,
    children: [
      { label: "Worker Requests", icon: ClipboardList, href: "/admin/staffing/requests" },
      { label: "Candidates", icon: UserCheck, href: "/admin/staffing/candidates" },
      { label: "Interviews", icon: Calendar, href: "/admin/staffing/interviews" },
      { label: "Assignments", icon: FileCheck, href: "/admin/staffing/assignments" },
    ],
  },
  {
    label: "Worker Pool",
    icon: Users,
    children: [
      { label: "Workers", icon: Users, href: "/admin/workers" },
      { label: "All Workers", icon: Users, href: "/admin/workers/all" },
      { label: "Active Workers", icon: UserCheck, href: "/admin/workers/active" },
      { label: "Available Workers", icon: UserPlus, href: "/admin/workers/available" },
      { label: "Onboarding", icon: FileText, href: "/admin/workers/onboarding" },
      { label: "Performance", icon: TrendingUp, href: "/admin/workers/performance" },
      { label: "Attendance", icon: Clock, href: "/admin/workers/attendance" },
      { label: "Leave", icon: Calendar, href: "/admin/workers/leave" },
      { label: "Documents", icon: FileText, href: "/admin/workers/documents" },
    ],
  },
  {
    label: "Companies",
    icon: Building2,
    children: [
      { label: "All Companies", icon: Building2, href: "/admin/companies/all" },
      { label: "Pending Companies", icon: Clock, href: "/admin/companies/pending" },
      { label: "Active Companies", icon: UserCheck, href: "/admin/companies/active" },
      { label: "Contracts", icon: FileCheck, href: "/admin/companies/contracts" },
    ],
  },
  {
    label: "Operations",
    icon: ClipboardList,
    children: [
      { label: "Tasks", icon: ClipboardList, href: "/admin/operations/tasks" },
      { label: "Complaints", icon: AlertCircle, href: "/admin/operations/complaints" },
      { label: "Support Tickets", icon: LifeBuoy, href: "/admin/operations/support" },
      { label: "Announcements", icon: BellRing, href: "/admin/operations/announcements" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    children: [
      { label: "Payroll", icon: Wallet, href: "/admin/finance/payroll" },
      { label: "Company Billing", icon: Building2, href: "/admin/finance/billing" },
      { label: "Invoices", icon: Receipt, href: "/admin/finance/invoices" },
      { label: "Transactions", icon: CreditCard, href: "/admin/finance/transactions" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Workforce Reports", icon: Users, href: "/admin/reports/workforce" },
      { label: "Company Reports", icon: Building2, href: "/admin/reports/companies" },
      { label: "Performance Reports", icon: TrendingUp, href: "/admin/reports/performance" },
      { label: "Financial Reports", icon: DollarSign, href: "/admin/reports/financial" },
    ],
  },
  {
    label: "System",
    icon: Settings,
    children: [
      { label: "Users & Roles", icon: UserCog, href: "/admin/system/users" },
      { label: "Notifications", icon: Bell, href: "/admin/system/notifications" },
      { label: "Audit Logs", icon: History, href: "/admin/system/audit" },
      { label: "Settings", icon: Settings, href: "/admin/system/settings" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Nav Section Component                                                     */
/* -------------------------------------------------------------------------- */

function NavSection({
  item,
  currentPath,
  level = 0,
  isCollapsed = false,
}: {
  item: NavItem;
  currentPath: string;
  level?: number;
  isCollapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren && item.href) {
    // Leaf item with href
    const isActive = currentPath === item.href;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-body-sm font-medium transition-colors",
          level === 0 && "pl-3",
          level === 1 && "pl-6",
          level === 2 && "pl-9",
          isActive
            ? "bg-primary-soft text-primary"
            : "text-ink-subtle hover:bg-surface-subtle hover:text-ink"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className="size-4 shrink-0" aria-hidden />
        {!isCollapsed && item.label}
      </Link>
    );
  }

  // Parent section with children
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-body-sm font-semibold transition-colors",
          level === 0 && "text-ink-soft hover:bg-surface-subtle hover:text-ink",
          level === 1 && "pl-6 text-ink-muted hover:bg-surface-subtle hover:text-ink"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className="size-4 shrink-0" aria-hidden />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {isOpen ? (
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            )}
          </>
        )}
      </button>

      {isOpen && hasChildren && !isCollapsed && (
        <div className="mt-0.5 space-y-0.5">
          {item.children!.map((child) => (
            <NavSection
              key={child.label}
              item={child}
              currentPath={currentPath}
              level={level + 1}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Admin Sidebar Component                                                   */
/* -------------------------------------------------------------------------- */

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  // Desktop sidebar
  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary">
          <ShieldCheck className="size-4 text-white" aria-hidden />
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-h6 leading-tight text-ink">ZYLO BRAINS</p>
            <p className="truncate text-caption text-ink-faint">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="border-b border-border p-3">
        <Link
          href="/"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            "text-body-sm font-medium text-ink-subtle",
            "transition-colors hover:bg-primary-soft hover:text-primary"
          )}
          title={isCollapsed ? "Back to Home" : undefined}
        >
          <Home className="size-4 shrink-0" aria-hidden />
          {!isCollapsed && "Back to Home"}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_STRUCTURE.map((section) => (
          <NavSection
            key={section.label}
            item={section}
            currentPath={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            "text-body-sm font-medium text-ink-subtle",
            "transition-colors hover:bg-danger-soft hover:text-danger"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          {!isCollapsed && "Sign Out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-border bg-surface transition-all duration-300 lg:flex",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {sidebarContent}

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute top-20 z-10 hidden size-8 items-center justify-center rounded-full border border-border bg-surface shadow-lg transition-all hover:bg-surface-subtle lg:flex",
            isCollapsed ? "left-[calc(5rem-1rem)]" : "left-[calc(18rem-1rem)]"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-4 text-ink-muted" aria-hidden />
          ) : (
            <PanelLeftClose className="size-4 text-ink-muted" aria-hidden />
          )}
        </button>
      </aside>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full bg-primary shadow-raised lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-6 text-white" aria-hidden />
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface lg:hidden">
            {sidebarContent}

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-subtle"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden />
            </button>
          </aside>
        </>
      )}
    </>
  );
}

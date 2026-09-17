"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Clock,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/worker/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/worker/profile",
    icon: User,
  },
  {
    title: "Attendance",
    href: "/worker/attendance",
    icon: Clock,
  },
  {
    title: "My Complaints",
    href: "/worker/complaints",
    icon: MessageSquare,
  },
  {
    title: "Support",
    href: "/worker/support",
    icon: HelpCircle,
  },
  {
    title: "Announcements",
    href: "/worker/announcements",
    icon: Megaphone,
  },
];

export function WorkerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
            <p className="text-xs text-muted-foreground">Worker Portal</p>
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

      {/* Back to Home */}
      <div className="px-4 pt-2 pb-4 border-b border-border">
        <Link href="/" className="no-underline">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center"
            )}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.title} href={item.href} className="no-underline">
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
                {!collapsed && <span className="flex-1">{item.title}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        <Link href="/worker/settings" className="no-underline">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/worker/settings"
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

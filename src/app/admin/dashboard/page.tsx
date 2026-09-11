import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Bell,
  Briefcase,
  Building2,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/* -------------------------------------------------------------------------- */
/*  Stat card                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  tone: "primary" | "success" | "warning" | "info";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-strong",
    info:    "bg-info-soft text-info",
  };
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
        <ChevronRight className="size-4 text-ink-faint" aria-hidden />
      </div>
      <p className="mt-4 text-metric font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-body-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-0.5 text-caption text-ink-faint">{sub}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ── Sidebar ── */}
      <AdminSidebar />

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
          <div>
            <h1 className="text-h5 text-ink">Dashboard</h1>
            <p className="text-caption text-ink-faint">
              Welcome back, {session.user.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success-soft px-2.5 py-1 text-label font-semibold text-success">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Admin
            </span>
            <span className="text-body-sm text-ink-muted">{session.user.email}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Registered Companies"
              value="0"
              sub="Awaiting first registration"
              tone="primary"
            />
            <StatCard
              icon={Users}
              label="Total Workers"
              value="0"
              sub="Active job seekers"
              tone="info"
            />
            <StatCard
              icon={Briefcase}
              label="Active Jobs"
              value="0"
              sub="Live requisitions"
              tone="success"
            />
            <StatCard
              icon={Bell}
              label="Pending Requests"
              value="0"
              sub="Company contact forms"
              tone="warning"
            />
          </div>

          {/* Placeholder panels */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Recent company requests */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <h2 className="text-h5 text-ink">Recent Company Requests</h2>
              <p className="mt-1 text-body-sm text-ink-muted">
                Companies that contacted via the website
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
                <Building2 className="size-10 text-ink-faint" aria-hidden />
                <p className="text-body-sm text-ink-muted">
                  No requests yet. When companies reach out, they&apos;ll appear here.
                </p>
              </div>
            </div>

            {/* Recent worker signups */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <h2 className="text-h5 text-ink">Recent Worker Signups</h2>
              <p className="mt-1 text-body-sm text-ink-muted">
                Latest candidates who registered
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
                <Users className="size-10 text-ink-faint" aria-hidden />
                <p className="text-body-sm text-ink-muted">
                  No workers yet. They&apos;ll appear here once they sign up.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

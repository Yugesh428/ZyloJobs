"use client";

import {
  ArrowRight,
  Bookmark,
  Info,
  MapPin,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job } from "@/components/public/job/jobData/jobData";

const LOGO_TONES = {
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
} as const;

export function JobDetailPanel({ job }: { job: Job }) {
  return (
    <article className="flex h-full flex-col">
      {/* ================= Header ================= */}
      <header className="border-b border-border pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* REQ badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-control",
                "border border-accent/30 bg-accent-soft px-2.5 py-1",
                "text-label font-semibold text-accent-hover",
              )}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              Requisition ID: {job.req}
            </span>

            <h1 className="mt-3 text-h3 leading-tight text-ink">{job.title}</h1>

            <div className="mt-3 flex items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-control",
                  "text-caption font-bold",
                  LOGO_TONES[job.companyTone],
                )}
              >
                {job.companyCode}
              </span>
              <p className="text-body-sm font-semibold text-ink-soft">
                {job.company}
              </p>
            </div>

            {/* Meta pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-0.5 text-label text-ink-subtle">
                <MapPin className="size-3" aria-hidden />
                {job.location}
              </span>
              <span className="inline-flex items-center rounded-full bg-surface-subtle px-2.5 py-0.5 text-label text-ink-subtle">
                {job.workplace}
              </span>
              <span className="text-caption text-ink-faint">
                Posted {job.postedAgo}
              </span>
            </div>
          </div>

          {/* Trust pill */}
          <div
            className={cn(
              "hidden shrink-0 rounded-control border border-primary/20 bg-primary-soft/50 px-3 py-2 text-right sm:block",
            )}
          >
            <p className="text-overline text-primary">Staffing Intermediary</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-label font-semibold text-primary">
              <ShieldCheck className="size-3.5" aria-hidden />
              ZYLO Verified
            </p>
          </div>
        </div>

        {/* Match banner */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-control border border-border bg-surface-subtle/60 px-4 py-3">
          <p className="text-body-sm text-ink-muted">
            <span className="tabular font-semibold text-ink">
              {job.candidatesEvaluated}
            </span>{" "}
            candidates evaluated by ZYLO BRAINS
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
              "text-label font-semibold",
              job.matchScore === "High Placement Match"
                ? "bg-success-soft text-success"
                : "bg-info-soft text-info",
            )}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {job.matchScore}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-control px-4",
              "bg-primary text-body-sm font-semibold text-white",
              "transition-colors hover:bg-primary-hover active:bg-primary-active",
            )}
          >
            Apply through ZYLO BRAINS
            <ArrowRight className="size-4" aria-hidden />
          </button>

          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-control px-4",
              "border border-border bg-surface text-body-sm font-medium text-ink-soft",
              "transition-colors hover:border-border-muted hover:bg-surface-subtle",
            )}
          >
            <Bookmark className="size-4" aria-hidden />
            Save Requisition
          </button>

          <button
            type="button"
            aria-label="Share requisition"
            className={cn(
              "grid size-10 place-items-center rounded-control",
              "border border-border bg-surface text-ink-muted",
              "transition-colors hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
            )}
          >
            <Share2 className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      {/* ================= Body (scrollable) ================= */}
      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        {/* How-it-works callout */}
        <div className="flex gap-3 rounded-card border border-primary/15 bg-primary-soft/40 p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white">
            <Info className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-label font-semibold text-primary">
              How this requisition works via ZYLO BRAINS:
            </p>
            <p className="mt-1 text-body-sm text-ink-muted">
              Your application is directly vetted and pre-screened by ZYLO
              BRAINS technical recruiters. We coordinate technical audit
              checkpoints, schedule direct client executive interviews, and
              oversee transparent remuneration structuring.
            </p>
          </div>
        </div>

        {/* Stat grid */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Experience", value: job.experience ?? "—" },
            { label: "Role Type", value: job.roleType },
            { label: "Compensation", value: job.salary ?? "Competitive" },
            { label: "Intermediary SLA", value: job.sla },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-control border border-border bg-surface p-3"
            >
              <dt className="overline">{stat.label}</dt>
              <dd className="mt-1.5 text-body-sm font-semibold text-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* About */}
        <section>
          <h2 className="text-h5 text-ink">About the Role</h2>
          <p className="mt-3 text-body text-ink-muted">{job.about}</p>
        </section>

        {/* Responsibilities */}
        <section>
          <h2 className="text-h5 text-ink">Key Responsibilities</h2>
          <ul className="mt-3 space-y-2.5">
            {job.responsibilities.map((r) => (
              <li key={r} className="flex gap-3 text-body-sm text-ink-muted">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                {r}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ================= Sticky footer ================= */}
      <footer
        className={cn(
          "sticky bottom-0 flex flex-wrap items-center justify-between gap-3",
          "border-t border-border bg-surface/95 py-4 backdrop-blur",
        )}
      >
        <p className="text-caption text-ink-subtle">
          Screened candidates presented within{" "}
          <span className="font-semibold text-ink">48 hours</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-caption font-semibold text-primary hover:text-primary-hover"
          >
            View Requisition PDF
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex h-9 items-center rounded-control px-4",
              "bg-primary text-body-sm font-semibold text-white uppercase",
              "transition-colors hover:bg-primary-hover",
            )}
          >
            Apply via ZYLO BRAINS
          </button>
        </div>
      </footer>
    </article>
  );
}

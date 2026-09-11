"use client";

import { Bell, MapPin } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import type { Job } from "@/components/public/job/jobData/jobData";

const BADGE_TONES = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning-strong",
} as const;

const LOGO_TONES = {
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
} as const;

function JobCard({
  job,
  onViewDetails,
  onApply,
}: {
  job: Job;
  onViewDetails: () => void;
  onApply: () => void;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5",
        "shadow-sm transition-all duration-200 ease-[var(--ease-standard)]",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg",
        "cursor-pointer"
      )}
      onClick={onViewDetails}
    >
      {/* Header: Logo + Company + Badge */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl",
            "text-label font-bold tracking-wide shadow-sm",
            LOGO_TONES[job.companyTone]
          )}
        >
          {job.companyCode}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 mb-2",
              "text-xs font-semibold whitespace-nowrap",
              BADGE_TONES[job.badgeTone]
            )}
          >
            {job.badge}
          </span>
          <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-ink-subtle truncate">
            {job.company}
          </p>
        </div>
      </div>

      {/* Location and type badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-subtle">
          <MapPin className="size-3.5" aria-hidden />
          <span className="font-medium">{job.location}</span>
        </span>
        <span className="size-1 rounded-full bg-border" aria-hidden />
        <span className="text-xs text-ink-subtle font-medium">
          {job.workplace}
        </span>
      </div>

      {/* Employment type & Experience */}
      {job.roleType && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-soft border border-border">
            {job.roleType}
          </span>
          <span className="inline-flex items-center rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-soft border border-border">
            {job.experience}
          </span>
        </div>
      )}

      {/* Salary */}
      {job.salary && (
        <div className="pt-2 border-t border-border">
          <p className="text-sm font-semibold text-primary">{job.salary}</p>
        </div>
      )}

      {/* Footer: Posted time + Apply button */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-ink-faint">{job.postedAgo}</span>
          <span className="text-xs text-ink-faint">{job.applicants} candidates</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg px-4",
            "bg-primary text-sm font-semibold text-white",
            "transition-all hover:bg-primary-hover hover:shadow-md active:bg-primary-active",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          Apply Now
        </button>
      </div>
    </article>
  );
}

export function JobGrid({
  jobs,
  onSelect,
  onApply,
}: {
  jobs: Job[];
  onSelect: (job: Job) => void;
  onApply: (job: Job) => void;
}) {
  const [alertOn, setAlertOn] = React.useState(true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h4 text-ink">
            Requisitions in <span className="text-primary">Kathmandu &amp; Remote</span>
          </h1>
          <p className="mt-1 text-caption text-ink-subtle">{jobs.length} verified open positions</p>
        </div>
        <button
          type="button"
          onClick={() => setAlertOn((v) => !v)}
          aria-pressed={alertOn}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-control px-3 py-1.5",
            "text-label font-semibold transition-colors",
            alertOn
              ? "bg-primary text-white"
              : "border border-border bg-surface text-ink-muted hover:bg-surface-subtle",
          )}
        >
          <Bell className="size-3.5" aria-hidden />
          Job Alert
          <span className={cn("relative h-3.5 w-6 rounded-full transition-colors", alertOn ? "bg-white/30" : "bg-border")}>
            <span className={cn("absolute top-0.5 size-2.5 rounded-full bg-white transition-transform", alertOn ? "translate-x-3" : "translate-x-0.5")} />
          </span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onViewDetails={() => onSelect(job)} onApply={() => onApply(job)} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { MapPin } from "lucide-react";
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

export function JobCard({
  job,
  selected,
  applied,
  onClick,
  onApply,
}: {
  job: Job;
  selected: boolean;
  applied: boolean;
  onClick: () => void;
  onApply: () => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selected}
      className={cn(
        "w-full cursor-pointer rounded-card border bg-surface p-4 text-left",
        "transition-all duration-150 ease-[var(--ease-standard)]",
        "hover:border-primary/30 hover:shadow-card",
        selected
          ? "border-primary shadow-card ring-1 ring-primary/20"
          : "border-border",
      )}
    >
      {/* ---------- Row 1: logo + title + more ---------- */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-control",
            "text-label font-bold tracking-wide",
            LOGO_TONES[job.companyTone],
          )}
        >
          {job.companyCode}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-h6 leading-tight font-semibold text-ink">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-caption text-ink-subtle">
            {job.company}
          </p>
        </div>

        <span
          aria-hidden
          className="text-ink-faint"
          title="More options (coming soon)"
        >
          ···
        </span>
      </div>

      {/* ---------- Row 2: meta pills ---------- */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full",
            "bg-surface-subtle px-2 py-0.5 text-label text-ink-subtle",
          )}
        >
          <MapPin className="size-3" aria-hidden />
          {job.location}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full",
            "bg-surface-subtle px-2 py-0.5 text-label text-ink-subtle",
          )}
        >
          {job.workplace.split(" ")[0]}
        </span>
      </div>

      {/* ---------- Row 3: salary / tag ---------- */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="tabular truncate text-body-sm font-semibold text-primary">
          {job.salary ?? job.experience}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5",
            "text-label font-semibold whitespace-nowrap",
            BADGE_TONES[job.badgeTone],
          )}
        >
          {job.badge}
        </span>
      </div>

      {/* ---------- Row 4: footer + application action ---------- */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-caption text-ink-faint">
        <span>
          {job.postedAgo} · {job.applicants} candidates
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onApply();
          }}
          disabled={applied}
          className={cn(
            "rounded-control px-3 py-1.5 text-label font-semibold transition-colors",
            applied
              ? "cursor-default bg-success-soft text-success"
              : "bg-primary text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          {applied ? "Applied" : "Apply now"}
        </button>
      </div>
    </article>
  );
}

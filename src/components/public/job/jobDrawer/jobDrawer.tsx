"use client";

import * as React from "react";
import {
  ArrowRight,
  Bookmark,
  Info,
  MapPin,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job } from "@/components/public/job/jobData/jobData";
import { ApplyModal } from "@/components/public/job/applyModal/applyModal";

/* -------------------------------------------------------------------------- */
/*  Tone maps                                                                  */
/* -------------------------------------------------------------------------- */

const LOGO_TONES = {
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
} as const;

/* -------------------------------------------------------------------------- */
/*  Drawer                                                                     */
/* -------------------------------------------------------------------------- */

export function JobDrawer({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const open = job !== null;
  const [applyJob, setApplyJob] = React.useState<Job | null>(null);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer on Escape (only when apply modal is not open)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !applyJob) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, applyJob]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm",
          "transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ── Drawer panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={job?.title ?? "Job detail"}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-2xl",
          "sm:w-[560px] lg:w-[640px]",
          "transition-transform duration-300 ease-[var(--ease-standard)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {job && (
          <DrawerContent
            job={job}
            onClose={onClose}
            onApply={() => setApplyJob(job)}
          />
        )}
      </div>

      {/* ── Apply modal (sits on top of drawer) ── */}
      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Drawer content                                                             */
/* -------------------------------------------------------------------------- */

function DrawerContent({
  job,
  onClose,
  onApply,
}: {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-control",
            "border border-accent/30 bg-accent-soft px-2.5 py-1",
            "text-label font-semibold text-accent-hover",
          )}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {job.req}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close job detail"
          className={cn(
            "grid size-9 place-items-center rounded-control",
            "border border-border text-ink-muted",
            "transition-colors hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
          )}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Title + company */}
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-xl",
              "text-label font-bold tracking-wide",
              LOGO_TONES[job.companyTone],
            )}
          >
            {job.companyCode}
          </span>
          <div className="min-w-0">
            <h1 className="text-h3 leading-tight text-ink">{job.title}</h1>
            <p className="mt-1 text-body-sm font-semibold text-ink-soft">
              {job.company}
            </p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-1 text-label text-ink-subtle">
            <MapPin className="size-3" aria-hidden />
            {job.location}
          </span>
          <span className="inline-flex items-center rounded-full bg-surface-subtle px-2.5 py-1 text-label text-ink-subtle">
            {job.workplace}
          </span>
          <span className="text-caption text-ink-faint">
            Posted {job.postedAgo}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-control border border-primary/20 bg-primary-soft/50 px-2.5 py-1 text-label font-semibold text-primary">
            <ShieldCheck className="size-3.5" aria-hidden />
            ZYLO Verified
          </span>
        </div>

        {/* Match banner */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-subtle/60 px-4 py-3">
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
            onClick={onApply}
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
            Save
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

        {/* How it works */}
        <div className="mt-6 flex gap-3 rounded-xl border border-primary/15 bg-primary-soft/40 p-4">
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

        {/* Stats grid */}
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Experience", value: job.experience ?? "—" },
            { label: "Role Type", value: job.roleType },
            { label: "Compensation", value: job.salary ?? "Competitive" },
            { label: "Intermediary SLA", value: job.sla },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <dt className="overline">{stat.label}</dt>
              <dd className="mt-1.5 text-body-sm font-semibold text-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* About the role */}
        <section className="mt-6">
          <h2 className="text-h5 text-ink">About the Role</h2>
          <p className="mt-3 text-body text-ink-muted">{job.about}</p>
        </section>

        {/* Responsibilities */}
        <section className="mt-6">
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

      {/* ── Sticky footer ── */}
      <div className="border-t border-border bg-surface/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-caption text-ink-subtle">
            Screened candidates within{" "}
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
              onClick={onApply}
              className={cn(
                "inline-flex h-9 items-center rounded-control px-4",
                "bg-primary text-body-sm font-semibold text-white uppercase tracking-wide",
                "transition-colors hover:bg-primary-hover",
              )}
            >
              Apply via ZYLO BRAINS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

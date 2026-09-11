/* -------------------------------------------------------------------------- */
/*  Featured Jobs                                                             */
/* -------------------------------------------------------------------------- */

import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { Reveal } from "@/components/public/reveak/reveal";
import { cn } from "@/lib/utils";

const FEATURED_JOBS = [
  {
    title: "Senior Frontend Engineer",
    company: "Northwind Logistics",
    location: "Remote · Global",
    type: "Full-time",
    salary: "Rs. 12L – 16L / yr",
    tag: "Urgent",
    tagTone: "danger" as const,
  },
  {
    title: "Compliance Analyst",
    company: "Vertex Health",
    location: "Kathmandu, NP",
    type: "Full-time",
    salary: "Rs. 82L – 1.05Cr / yr",
    tag: "Verified",
    tagTone: "success" as const,
  },
  {
    title: "Warehouse Operations Lead",
    company: "Aurora Retail",
    location: "Pokhara, NP",
    type: "Contract",
    salary: "Rs. 4.5L / mo",
    tag: "Screening",
    tagTone: "info" as const,
  },
  {
    title: "Data Scientist",
    company: "Brains Analytics",
    location: "Remote · Global",
    type: "Full-time",
    salary: "Rs. 14L – 18L / yr",
    tag: "Pending Review",
    tagTone: "warning" as const,
  },
] as const;

const TAG_STYLES = {
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning-strong border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
} as const;

export function FeaturedJobs() {
  return (
    <section className="border-y border-border bg-surface-subtle/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <Reveal>
          <p className="overline">Featured openings</p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-h2 max-w-xl">
              Hand-picked roles from verified employers.
            </h2>

            <Link
              href="/jobs"
              className={cn(
                "group inline-flex items-center gap-1.5",
                "text-body-sm font-semibold text-primary",
                "transition-colors hover:text-primary-hover",
              )}
            >
              Browse all jobs
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        {/* ---------- Grid ---------- */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {FEATURED_JOBS.map((job, i) => (
            <Reveal key={job.title} delay={i * 0.06}>
              <article
                className={cn(
                  "group flex flex-col gap-5 rounded-card border border-border",
                  "bg-surface p-6 shadow-card",
                  "transition-all duration-200 ease-[var(--ease-standard)]",
                  "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised",
                )}
              >
                {/* ---------- Top: icon + title + company + badge ---------- */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-control bg-primary-soft text-primary">
                      <Briefcase className="size-5" aria-hidden />
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-h5 leading-tight text-ink">
                        {job.title}
                      </h3>
                      <p className="mt-0.5 truncate text-caption text-ink-subtle">
                        {job.company}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5",
                      "text-label font-semibold whitespace-nowrap",
                      TAG_STYLES[job.tagTone],
                    )}
                  >
                    {job.tag}
                  </span>
                </div>

                {/* ---------- Middle: metadata ---------- */}
                <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div className="min-w-0">
                    <dt className="overline">Location</dt>
                    <dd className="mt-1 truncate text-body-sm text-ink-muted">
                      {job.location}
                    </dd>
                  </div>

                  <div className="min-w-0">
                    <dt className="overline">Type</dt>
                    <dd className="mt-1 truncate text-body-sm text-ink-muted">
                      {job.type}
                    </dd>
                  </div>

                  <div className="min-w-0">
                    <dt className="overline">Salary</dt>
                    <dd className="tabular mt-1 truncate text-body-sm font-semibold text-primary">
                      {job.salary}
                    </dd>
                  </div>
                </dl>

                {/* ---------- Bottom: actions ---------- */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/jobs/${job.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "text-body-sm font-semibold text-primary",
                      "transition-colors hover:text-primary-hover",
                    )}
                  >
                    View role
                  </Link>

                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-control px-3.5",
                      "border border-border bg-surface text-body-sm font-medium text-ink-soft",
                      "transition-colors duration-150",
                      "hover:border-primary/30 hover:bg-primary-soft/40 hover:text-primary",
                    )}
                  >
                    Apply now
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

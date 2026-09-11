import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/public/reveak/reveal";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Tone maps                                                                 */
/* -------------------------------------------------------------------------- */

type Tone = "info" | "warning" | "success" | "primary";

const CATEGORY_TONES: Record<Tone, string> = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning-strong",
  success: "bg-success-soft text-success",
  primary: "bg-primary-soft text-primary",
};

const STATUS_TONES = {
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
} as const;

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const TOP_JOBS = [
  {
    category: "Technology & Cloud",
    categoryTone: "info" as Tone,
    status: "Screening Open",
    statusTone: "success" as const,
    title: "Senior Cloud Architect",
    req: "REQ #8492",
    company: "Enterprise Fintech",
    description:
      "Lead multicloud migration architectures, cloud compliance frameworks, and microservices...",
    location: "Kathmandu, NP (Hybrid)",
    salary: "Rs. 20.6L – 24L / yr",
  },
  {
    category: "Hospitality & Ops",
    categoryTone: "warning" as Tone,
    status: "Active Pipeline",
    statusTone: "info" as const,
    title: "Hotel Operations Manager",
    req: "REQ #7218",
    company: "Luxury Resort Group",
    description:
      "Supervise end-to-end departmental logistics, guest hospitality standards, VIP relations, and...",
    location: "Pokhara, NP (On-site)",
    salary: "Rs. 12L – 14.6L / yr",
  },
  {
    category: "Healthcare & Medical",
    categoryTone: "success" as Tone,
    status: "Screening Open",
    statusTone: "success" as const,
    title: "Clinical Nurse Lead",
    req: "REQ #9104",
    company: "Regional Medical Network",
    description:
      "Oversee acute care units, coordinate shift allocations, patient assessment auditing, and...",
    location: "Lalitpur, NP (On-site)",
    salary: "Rs. 14L – 16.6L / yr",
  },
  {
    category: "Supply Chain & Freight",
    categoryTone: "info" as Tone,
    status: "Active Pipeline",
    statusTone: "info" as const,
    title: "Logistics & Warehouse Supervisor",
    req: "REQ #6138",
    company: "Global Distribution Corp",
    description:
      "Orchestrate fulfillment throughput, automated inventory routing, worker safety guidelines, and...",
    location: "Biratnagar, NP (Facility)",
    salary: "Rs. 10.4L – 12.2L / yr",
  },
  {
    category: "Finance & Accounting",
    categoryTone: "primary" as Tone,
    status: "Screening Open",
    statusTone: "success" as const,
    title: "Enterprise Financial Analyst",
    req: "REQ #5519",
    company: "Global Advisory Group",
    description:
      "Conduct cash-flow projections, fiscal budgeting audits, variance reporting, and high-priority M&A...",
    location: "Kathmandu, NP (Hybrid)",
    salary: "Rs. 16L – 18.6L / yr",
  },
  {
    category: "Engineering & Safety",
    categoryTone: "warning" as Tone,
    status: "Active Pipeline",
    statusTone: "info" as const,
    title: "Industrial Safety Inspector",
    req: "REQ #3901",
    company: "Heavy Manufacturing Ltd",
    description:
      "Manage OSHA compliance verification, workplace risk mitigation, hazardous materials handling, an...",
    location: "Biratnagar, NP (On-site)",
    salary: "Rs. 11.3L – 13L / yr",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function TopJobs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ---------- Header ---------- */}
      <Reveal>
        <p className={cn("overline !text-accent")}>Active opportunities</p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-h2 text-ink">Our Top Jobs</h2>
            <p className="mt-2 max-w-xl text-body text-ink-muted">
              Explore high-priority requisitions actively managed through our
              staffing pipeline.
            </p>
          </div>

          <Link
            href="/jobs"
            className={cn(
              "group inline-flex items-center gap-1",
              "text-body-sm font-semibold text-primary",
              "transition-colors hover:text-primary-hover",
            )}
          >
            View all open requisitions
            <ChevronRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </Reveal>

      {/* ---------- Grid ---------- */}
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOP_JOBS.map((job, i) => (
          <Reveal key={job.req} delay={i * 0.06}>
            <article
              className={cn(
                "group flex h-full flex-col gap-4 rounded-card border border-border",
                "bg-surface p-5 shadow-card",
                "transition-all duration-200 ease-[var(--ease-standard)]",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised",
              )}
            >
              {/* ---------- Tags ---------- */}
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5",
                    "text-label font-semibold whitespace-nowrap",
                    CATEGORY_TONES[job.categoryTone],
                  )}
                >
                  {job.category}
                </span>

                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5",
                    "text-label font-semibold whitespace-nowrap",
                    STATUS_TONES[job.statusTone],
                  )}
                >
                  {job.status}
                </span>
              </div>

              {/* ---------- Title + REQ + company ---------- */}
              <div className="min-w-0">
                <h3 className="text-h5 leading-tight text-ink">{job.title}</h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-caption text-ink-subtle">
                  <span className="tabular">{job.req}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate">{job.company}</span>
                </p>
              </div>

              {/* ---------- Description ---------- */}
              <p className="truncate-2 text-body-sm text-ink-muted">
                {job.description}
              </p>

              {/* ---------- Footer ---------- */}
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="flex min-w-0 items-center gap-1.5 text-caption text-ink-subtle">
                  <MapPin
                    aria-hidden
                    className="size-3.5 shrink-0 text-ink-faint"
                  />
                  <span className="truncate">{job.location}</span>
                </span>

                <span className="tabular shrink-0 text-body-sm font-semibold text-primary">
                  {job.salary}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

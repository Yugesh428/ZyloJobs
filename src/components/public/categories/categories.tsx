/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cpu,
  HeartPulse,
  Landmark,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/public/reveak/reveal";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    icon: Cpu,
    label: "Technology & IT",
    count: 342,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    hoverColor: "group-hover:bg-blue-600 group-hover:text-white",
    accent: "text-blue-600",
    tag: "Most Active",
  },
  {
    icon: HeartPulse,
    label: "Healthcare",
    count: 218,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    hoverColor: "group-hover:bg-rose-500 group-hover:text-white",
    accent: "text-rose-600",
    tag: "High Demand",
  },
  {
    icon: Landmark,
    label: "Finance & Banking",
    count: 176,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hoverColor: "group-hover:bg-emerald-600 group-hover:text-white",
    accent: "text-emerald-600",
    tag: null,
  },
  {
    icon: Package,
    label: "Logistics & Supply",
    count: 154,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    hoverColor: "group-hover:bg-amber-500 group-hover:text-white",
    accent: "text-amber-600",
    tag: null,
  },
  {
    icon: Building2,
    label: "Construction",
    count: 121,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    hoverColor: "group-hover:bg-orange-500 group-hover:text-white",
    accent: "text-orange-600",
    tag: null,
  },
  {
    icon: ShieldCheck,
    label: "Compliance & Audit",
    count: 89,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    hoverColor: "group-hover:bg-violet-600 group-hover:text-white",
    accent: "text-violet-600",
    tag: null,
  },
] as const;

export function Categories() {
  return (
    <section className="bg-surface-subtle/40 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="overline !text-primary">Browse by sector</p>
              <h2 className="mt-2 text-h2 text-ink">
                Explore roles across the{" "}
                <span className="text-primary">industries</span> we specialise
                in.
              </h2>
              <p className="mt-2 max-w-lg text-body text-ink-muted">
                From technology to healthcare — find opportunities in the sector
                that matches your expertise.
              </p>
            </div>

            <Link
              href="/jobs"
              className={cn(
                "group inline-flex items-center gap-1.5",
                "text-body-sm font-semibold text-primary",
                "transition-colors hover:text-primary-hover",
              )}
            >
              View all categories
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        {/* ---------- Grid ---------- */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <Link
                href={`/jobs?category=${encodeURIComponent(c.label)}`}
                aria-label={`Browse ${c.label} — ${c.count} open roles`}
                className={cn(
                  "group relative flex items-center gap-4 rounded-xl",
                  "border border-border bg-surface p-4 shadow-card",
                  "transition-all duration-200 ease-[var(--ease-standard)]",
                  "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-raised",
                  "focus-visible:outline-2 focus-visible:outline-primary",
                )}
              >
                {/* Icon */}
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-xl border",
                    "transition-all duration-200",
                    c.color,
                    c.hoverColor,
                  )}
                >
                  <c.icon className="size-5" aria-hidden />
                </span>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-h6 text-ink transition-colors duration-150 group-hover:text-primary">
                      {c.label}
                    </p>
                    {c.tag && (
                      <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-label font-semibold text-primary">
                        {c.tag}
                      </span>
                    )}
                  </div>
                  <p className={cn("mt-0.5 text-caption font-medium", c.accent)}>
                    {c.count} open roles
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-ink-faint",
                    "transition-all duration-200",
                    "group-hover:translate-x-0.5 group-hover:text-primary",
                  )}
                />
              </Link>
            </Reveal>
          ))}
        </div>

        {/* ---------- Bottom CTA strip ---------- */}
        <Reveal delay={0.4}>
          <div
            className={cn(
              "mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl",
              "border border-primary/15 bg-primary-soft px-6 py-4",
            )}
          >
            <div>
              <p className="text-h6 text-primary">
                Can&apos;t find your industry?
              </p>
              <p className="mt-0.5 text-caption text-ink-muted">
                We place talent across 20+ sectors. Talk to our recruitment
                team.
              </p>
            </div>
            <Link
              href="/contact"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-control px-4",
                "bg-primary text-body-sm font-semibold text-white",
                "transition-colors duration-150 hover:bg-primary-hover",
              )}
            >
              Contact Us
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import * as React from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type JobFilters = {
  sector: string;
  experience: string;
  workplace: string | null;
  jobType: string;
  preScreened: boolean;
  sort: string;
};

const DEFAULT_FILTERS: JobFilters = {
  sector: "All Sectors",
  experience: "All Levels",
  workplace: "Hybrid & Remote",
  jobType: "Full-Time",
  preScreened: false,
  sort: "Most Recent",
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const SECTORS = [
  { label: "All Sectors", count: 142 },
  { label: "Information Technology", count: 48 },
  { label: "Hospitality & Tourism", count: 26 },
  { label: "Healthcare & Clinical", count: 18 },
  { label: "Engineering & Construction", count: 21 },
  { label: "Finance & Accounting", count: 15 },
  { label: "Supply Chain & Logistics", count: 14 },
] as const;

const EXPERIENCE_OPTIONS = [
  "All Levels",
  "Entry Level",
  "Mid Level",
  "Senior",
  "Executive",
] as const;
const JOB_TYPE_OPTIONS = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Internship",
] as const;
const SORT_OPTIONS = [
  "Most Recent",
  "Salary: High to Low",
  "Salary: Low to High",
  "Closing Soon",
] as const;

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function SectorPill({
  label,
  count,
  active,
  scrolled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  scrolled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4",
        "text-body-sm font-semibold whitespace-nowrap",
        "transition-colors duration-150",
        active && !scrolled && "bg-primary text-white shadow-sm",
        active && scrolled && "bg-white text-primary shadow-sm",
        !active && !scrolled &&
          "border border-border bg-surface text-ink-muted hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
        !active && scrolled &&
          "border border-white/25 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white",
      )}
    >
      {label}
      <span
        className={cn(
          "tabular text-caption",
          active && !scrolled && "text-white/80",
          active && scrolled && "text-primary/70",
          !active && !scrolled && "text-ink-faint",
          !active && scrolled && "text-white/50",
        )}
      >
        ({count})
      </span>
    </button>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  scrolled,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  scrolled: boolean;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 rounded-control",
        "pl-3 pr-8 text-body-sm font-medium",
        "transition-colors duration-150",
        scrolled
          ? "border border-white/25 bg-white/10 text-white/80 hover:bg-white/20 focus-within:border-white/50"
          : "border border-border bg-surface text-ink-soft hover:border-border-muted hover:bg-surface-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
      )}
    >
      <span className={scrolled ? "text-white/60" : "text-ink-subtle"}>{label}:</span>
      <span className={cn("font-semibold", scrolled ? "text-white" : "text-ink")}>{value}</span>
      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-2.5 size-3.5",
          scrolled ? "text-white/50" : "text-ink-faint",
        )}
      />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function WorkplaceChip({
  value,
  onClear,
  scrolled,
}: {
  value: string;
  onClear: () => void;
  scrolled: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-control pl-3 pr-1.5",
        "text-body-sm font-medium",
        scrolled
          ? "border border-white/40 bg-white/15"
          : "border border-primary bg-primary-soft/60",
      )}
    >
      <span className={scrolled ? "text-white/70" : "text-ink-subtle"}>Workplace:</span>
      <span className={cn("font-semibold", scrolled ? "text-white" : "text-primary")}>{value}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear workplace filter"
        className={cn(
          "grid size-6 place-items-center rounded-full transition-colors",
          scrolled ? "text-white/70 hover:bg-white/20 hover:text-white" : "text-primary hover:bg-primary/15",
        )}
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  );
}

function PreScreenedToggle({
  active,
  onToggle,
  scrolled,
}: {
  active: boolean;
  onToggle: () => void;
  scrolled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-control px-3",
        "text-body-sm font-semibold whitespace-nowrap",
        "transition-colors duration-150",
        scrolled
          ? active
            ? "border border-white/40 bg-white/15 text-white"
            : "border border-white/25 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          : active
          ? "border border-accent bg-accent-soft/60 text-accent-hover"
          : "border border-warning/40 bg-warning-tint/60 text-warning-strong hover:bg-warning-soft/60",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full transition-colors",
          scrolled ? "bg-white" : active ? "bg-accent" : "bg-warning",
        )}
      />
      ZYLO Pre-Screened Only
    </button>
  );
}

function SortControl({
  value,
  options,
  onChange,
  scrolled,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  scrolled: boolean;
}) {
  return (
    <label
      className={cn(
        "relative ml-auto inline-flex h-9 items-center gap-1.5 rounded-control",
        "pl-3 pr-8 text-body-sm font-medium",
        "transition-colors",
        scrolled ? "text-white/70 hover:text-white" : "text-ink-subtle hover:text-ink focus-within:text-ink",
      )}
    >
      <span className="tracking-wide uppercase">Sort:</span>
      <span className={cn("font-semibold", scrolled ? "text-white" : "text-ink")}>{value}</span>
      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-2.5 size-3.5",
          scrolled ? "text-white/50" : "text-ink-faint",
        )}
      />
      <select
        aria-label="Sort jobs by"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function Categories({
  filters: controlled,
  onChange,
}: {
  filters?: JobFilters;
  onChange?: (next: JobFilters) => void;
}) {
  const [internal, setInternal] = React.useState<JobFilters>(DEFAULT_FILTERS);
  const filters = controlled ?? internal;
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const update = (patch: Partial<JobFilters>) => {
    const next = { ...filters, ...patch };
    if (controlled === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        "sticky top-16 z-30 border-b backdrop-blur transition-colors duration-300",
        "supports-[backdrop-filter]:bg-opacity-95",
        scrolled
          ? "border-primary-active bg-primary/95"
          : "border-border bg-surface/95",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================== Sector pills ================== */}
        <div
          role="tablist"
          aria-label="Job sectors"
          className={cn(
            "flex items-center gap-2 overflow-x-auto py-3",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {SECTORS.map((s) => (
            <SectorPill
              key={s.label}
              label={s.label}
              count={s.count}
              active={filters.sector === s.label}
              scrolled={scrolled}
              onClick={() => update({ sector: s.label })}
            />
          ))}
        </div>

        {/* ================== Filter row ================== */}
        <div className="flex flex-wrap items-center gap-2 pb-3">
          <FilterDropdown
            label="Experience"
            value={filters.experience}
            options={EXPERIENCE_OPTIONS}
            onChange={(v) => update({ experience: v })}
            scrolled={scrolled}
          />

          {filters.workplace ? (
            <WorkplaceChip
              value={filters.workplace}
              onClear={() => update({ workplace: null })}
              scrolled={scrolled}
            />
          ) : (
            <button
              type="button"
              onClick={() => update({ workplace: "Hybrid & Remote" })}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-control px-3",
                "text-body-sm font-medium",
                "transition-colors",
                scrolled
                  ? "border border-white/30 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  : "border border-border bg-surface text-ink-soft hover:border-border-muted hover:bg-surface-subtle",
              )}
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Workplace
            </button>
          )}

          <FilterDropdown
            label="Job Type"
            value={filters.jobType}
            options={JOB_TYPE_OPTIONS}
            onChange={(v) => update({ jobType: v })}
            scrolled={scrolled}
          />

          <PreScreenedToggle
            active={filters.preScreened}
            onToggle={() => update({ preScreened: !filters.preScreened })}
            scrolled={scrolled}
          />

          <SortControl
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(v) => update({ sort: v })}
            scrolled={scrolled}
          />
        </div>
      </div>
    </div>
  );
}

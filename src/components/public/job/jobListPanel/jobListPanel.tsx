"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobCard } from "../jobCard/jobCard";
import type { Job } from "../jobData/jobData";

export function JobListPanel({
  jobs,
  selectedId,
  onSelect,
}: {
  jobs: Job[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [alertOn, setAlertOn] = React.useState(true);
  const [appliedJobIds, setAppliedJobIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  return (
    <aside className="flex h-full flex-col">
      {/* ---------- Header ---------- */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <h1 className="text-h5 leading-tight text-ink">
            Requisitions in Kathmandu & Remote
          </h1>
          <p className="mt-1 text-caption text-ink-subtle">
            {jobs.length} verified open positions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAlertOn((v) => !v)}
          aria-pressed={alertOn}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-control px-3 py-1.5",
            "text-label font-semibold",
            "transition-colors duration-150",
            alertOn
              ? "bg-primary text-white"
              : "border border-border bg-surface text-ink-muted hover:bg-surface-subtle",
          )}
        >
          Job Alert
          <span
            className={cn(
              "relative h-3.5 w-6 rounded-full transition-colors",
              alertOn ? "bg-white/30" : "bg-border",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-2.5 rounded-full bg-white transition-transform",
                alertOn ? "translate-x-3" : "translate-x-0.5",
              )}
            />
          </span>
        </button>
      </div>

      {/* ---------- Scrollable list ---------- */}
      <div className="mt-4 space-y-3 overflow-y-auto pb-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            selected={job.id === selectedId}
            onClick={() => onSelect(job.id)}
            applied={appliedJobIds.has(job.id)}
            onApply={() =>
              setAppliedJobIds((current) => new Set(current).add(job.id))
            }
          />
        ))}
      </div>
    </aside>
  );
}

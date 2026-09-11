"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job } from "@/components/public/job/jobData/jobData";

/* -------------------------------------------------------------------------- */
/*  Apply Modal                                                                */
/* -------------------------------------------------------------------------- */

export function ApplyModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const open = job !== null;

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm",
          "transition-opacity duration-250",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Apply for job"
        className={cn(
          "fixed inset-0 z-[70] flex items-center justify-center p-4",
          "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl bg-surface shadow-2xl",
            "pointer-events-auto",
            "transition-all duration-300 ease-[var(--ease-standard)]",
            open ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {job && <ModalContent job={job} onClose={onClose} />}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal content                                                              */
/* -------------------------------------------------------------------------- */

function ModalContent({ job, onClose }: { job: Job; onClose: () => void }) {
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h2 className="text-h4 text-ink">Application Submitted!</h2>
        <p className="max-w-sm text-body-sm text-ink-muted">
          Your application for{" "}
          <span className="font-semibold text-ink">{job.title}</span> at{" "}
          <span className="font-semibold text-ink">{job.company}</span> has been
          received. Our team will review and reach out within{" "}
          <span className="font-semibold text-ink">48 hours</span>.
        </p>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "mt-2 inline-flex h-10 items-center rounded-control px-6",
            "bg-primary text-body-sm font-semibold text-white",
            "transition-colors hover:bg-primary-hover",
          )}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
        <div className="min-w-0">
          <p className="overline !text-primary">Apply via ZYLO BRAINS</p>
          <h2 className="mt-1 truncate text-h4 text-ink">{job.title}</h2>
          <p className="mt-0.5 truncate text-body-sm text-ink-subtle">
            {job.company} · {job.location}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application form"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-control",
            "border border-border text-ink-muted",
            "transition-colors hover:border-border-muted hover:bg-surface-subtle hover:text-ink",
          )}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apply-name" className="text-label font-medium text-ink-muted">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            id="apply-name"
            type="text"
            required
            placeholder="e.g. Aarav Sharma"
            className={cn(
              "h-11 rounded-control border border-border bg-surface px-3",
              "text-body-sm text-ink placeholder:text-ink-faint",
              "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
            )}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apply-phone" className="text-label font-medium text-ink-muted">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            id="apply-phone"
            type="tel"
            required
            placeholder="+977 98XXXXXXXX"
            className={cn(
              "h-11 rounded-control border border-border bg-surface px-3",
              "text-body-sm text-ink placeholder:text-ink-faint",
              "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
            )}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apply-email" className="text-label font-medium text-ink-muted">
            Email Address{" "}
            <span className="text-ink-faint font-normal">(optional)</span>
          </label>
          <input
            id="apply-email"
            type="email"
            placeholder="you@example.com"
            className={cn(
              "h-11 rounded-control border border-border bg-surface px-3",
              "text-body-sm text-ink placeholder:text-ink-faint",
              "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
            )}
          />
        </div>

        {/* CV upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label font-medium text-ink-muted">
            Upload CV / Resume{" "}
            <span className="text-ink-faint font-normal">(optional)</span>
          </label>

          <input
            ref={fileRef}
            id="apply-cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />

          {cvFile ? (
            /* File selected — show name + remove */
            <div
              className={cn(
                "flex items-center gap-3 rounded-control border border-primary/30 bg-primary-soft/40 px-3 py-2.5",
              )}
            >
              <FileText className="size-5 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-ink">
                {cvFile.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCvFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                aria-label="Remove file"
                className="grid size-6 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-primary/10 hover:text-danger"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            /* Drop zone */
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex flex-col items-center gap-2 rounded-control border-2 border-dashed border-border",
                "bg-surface-subtle/50 px-4 py-6",
                "text-body-sm text-ink-muted",
                "transition-colors hover:border-primary/40 hover:bg-primary-soft/20 hover:text-ink",
              )}
            >
              <Upload className="size-6 text-ink-faint" aria-hidden />
              <span>
                <span className="font-semibold text-primary">Browse file</span>{" "}
                or drag and drop
              </span>
              <span className="text-caption text-ink-faint">
                PDF, DOC, DOCX — max 5 MB
              </span>
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={cn(
            "inline-flex w-full h-11 items-center justify-center gap-2 rounded-control",
            "bg-primary text-body-sm font-semibold text-white",
            "transition-colors hover:bg-primary-hover active:bg-primary-active",
          )}
        >
          Submit Application
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <p className="text-center text-caption text-ink-faint">
          Your details are shared only with ZYLO BRAINS recruiters.
        </p>
      </form>
    </div>
  );
}

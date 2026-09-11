"use client";

import * as React from "react";
import { Categories } from "@/components/public/job/categories/categories";
import { JobGrid } from "@/components/public/job/jobGrid/jobGrid";
import { JobDrawer } from "@/components/public/job/jobDrawer/jobDrawer";
import { ApplyModal } from "@/components/public/job/applyModal/applyModal";
import { JOBS } from "@/components/public/job/jobData/jobData";
import type { Job } from "@/components/public/job/jobData/jobData";

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [applyJob, setApplyJob] = React.useState<Job | null>(null);

  return (
    <>
      <Categories />

      <JobGrid
        jobs={JOBS}
        onSelect={setSelectedJob}
        onApply={setApplyJob}
      />

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Shared apply modal — triggered from cards OR drawer */}
      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </>
  );
}

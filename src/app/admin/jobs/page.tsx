"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import {
  JobStatsCards,
  JobFilters,
  JobTable,
  JobDetailsDialog,
  JobForm,
  type Job,
} from "../../../components/admin/jobComponent";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchJobs();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.jobLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.responsibilities &&
            job.responsibilities
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (job.requiredSkills &&
            job.requiredSkills.some((skill) =>
              skill.toLowerCase().includes(searchQuery.toLowerCase()),
            )),
      );
    }

    setFilteredJobs(filtered);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Job deleted successfully!");
        fetchJobs();
      } else {
        toast.error("Failed to delete job");
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job");
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedJob(null);
    setShowFormDialog(true);
  };

  const handleEditClick = (job: Job) => {
    setFormMode("edit");
    setSelectedJob(job);
    setShowFormDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Jobs"
        description="Manage job postings and track their progress"
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        }
      />

      <JobStatsCards jobs={jobs} />

      <JobFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
      />

      <JobTable
        data={filteredJobs}
        onView={(job) => {
          setSelectedJob(job);
          setShowDetailsDialog(true);
        }}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <JobDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        job={selectedJob}
        onEdit={handleEditClick}
      />

      <JobForm
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={formMode}
        initialData={selectedJob ?? undefined}
        onSuccess={fetchJobs}
      />
    </div>
  );
}
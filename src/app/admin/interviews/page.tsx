"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/Pagination";
import {
  InterviewStatsCards,
  InterviewFilters,
  InterviewTable,
  InterviewDetailsDialog,
  InterviewForm,
  type Interview,
} from "@/components/admin/InterviewComponents";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchInterviews();
  }, [currentPage, statusFilter, typeFilter]);

  useEffect(() => {
    filterInterviews();
  }, [interviews, searchQuery]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const response = await fetch(`/api/interviews?${params}`);
      const data = await response.json();

      if (data.success) {
        setInterviews(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.workerId.toLowerCase().includes(q) ||
          i.worker?.fullName.toLowerCase().includes(q) ||
          i.worker?.email.toLowerCase().includes(q) ||
          i.job?.jobRole.toLowerCase().includes(q) ||
          (i.location && i.location.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q)) ||
          (i.feedback && i.feedback.toLowerCase().includes(q)) ||
          String(i.round).includes(q)
      );
    }

    setFilteredInterviews(filtered);
  };

  const handleDelete = async (interviewId: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Interview deleted successfully!");
        fetchInterviews();
      } else {
        toast.error("Failed to delete interview");
      }
    } catch (error) {
      console.error("Failed to delete interview:", error);
      toast.error("Failed to delete interview");
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedInterview(null);
    setFormKey((k) => k + 1);
    setShowFormDialog(true);
  };

  const handleEditClick = (interview: Interview) => {
    setFormMode("edit");
    setSelectedInterview(interview);
    setFormKey((k) => k + 1);
    setShowFormDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Interviews"
        description="Schedule and manage interviews for job applications"
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        }
      />

      <InterviewStatsCards interviews={interviews} />

      <InterviewFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
        typeFilter={typeFilter}
        onTypeChange={(value) => {
          setTypeFilter(value);
          setCurrentPage(1);
        }}
      />

      <InterviewTable
        data={filteredInterviews}
        onView={(interview) => {
          setSelectedInterview(interview);
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

      <InterviewDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        interview={selectedInterview}
        onEdit={handleEditClick}
      />

      <InterviewForm
        key={formKey}
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={formMode}
        applicationId={selectedInterview?.applicationId}
        workerId={selectedInterview?.workerId}
        jobId={selectedInterview?.jobId}
        initialData={selectedInterview || undefined}
        onSuccess={fetchInterviews}
      />
    </div>
  );
}
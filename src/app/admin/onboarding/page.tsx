"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import {
  OnboardingStatsCards,
  OnboardingFilters,
  OnboardingTable,
  OnboardingDetailsDialog,
  OnboardingForm,
  type Onboarding,
} from "@/components/admin/OnboardingComponents";

export default function OnboardingPage() {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [filteredOnboardings, setFilteredOnboardings] = useState<Onboarding[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedOnboarding, setSelectedOnboarding] =
    useState<Onboarding | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchOnboardings();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterOnboardings();
  }, [onboardings, searchQuery]);

  const fetchOnboardings = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/onboarding?${params}`);
      const data = await response.json();

      if (data.success) {
        setOnboardings(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch onboardings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOnboardings = () => {
    let filtered = [...onboardings];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          (o.worker?.fullName || "").toLowerCase().includes(q) ||
          (o.worker?.email || "").toLowerCase().includes(q) ||
          (o.job?.jobRole || "").toLowerCase().includes(q) ||
          (o.job?.department || "").toLowerCase().includes(q) ||
          (o.company?.companyName || "").toLowerCase().includes(q) ||
          (o.company?.industry || "").toLowerCase().includes(q) ||
          (o.notes || "").toLowerCase().includes(q),
      );
    }

    setFilteredOnboardings(filtered);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this onboarding record? This cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/onboarding/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || "Onboarding record deleted successfully!");
        fetchOnboardings();
      } else {
        toast.error(data.error || "Failed to delete onboarding record");
      }
    } catch (error) {
      console.error("Failed to delete onboarding:", error);
      toast.error("Failed to delete onboarding record. Please try again.");
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedOnboarding(null);
    setFormKey((k) => k + 1);
    setShowFormDialog(true);
  };

  const handleEditClick = (onboarding: Onboarding) => {
    setFormMode("edit");
    setSelectedOnboarding(onboarding);
    setFormKey((k) => k + 1);
    setShowFormDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading onboardings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Onboarding"
        description="Manage worker onboarding and placement records"
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Onboarding
          </Button>
        }
      />

      <OnboardingStatsCards onboardings={onboardings} />

      <OnboardingFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
      />

      <OnboardingTable
        data={filteredOnboardings}
        onView={(o) => {
          setSelectedOnboarding(o);
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

      <OnboardingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onboarding={selectedOnboarding}
        onEdit={handleEditClick}
      />

      <OnboardingForm
        key={formKey}
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={formMode}
        initialData={selectedOnboarding || undefined}
        onSuccess={fetchOnboardings}
      />
    </div>
  );
}
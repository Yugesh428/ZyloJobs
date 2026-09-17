"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComplaintStatsCards,
  ComplaintFilters,
  WorkerComplaintTable,
  CompanyComplaintTable,
  WorkerComplaintDetailsDialog,
  CompanyComplaintDetailsDialog,
  ComplaintReviewForm,
  WORKER_CATEGORY_LABELS,
  COMPANY_CATEGORY_LABELS,
  type WorkerComplaint,
  type CompanyComplaint,
} from "@/components/admin/ComplaintsComponents";

/* ------------------------------------------------------------------ */
/* Worker Complaints Tab — filed by companies against workers         */
/* ------------------------------------------------------------------ */

function WorkerComplaintsTab() {
  const [complaints, setComplaints] = useState<WorkerComplaint[]>([]);
  const [filtered,   setFiltered]   = useState<WorkerComplaint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const itemsPerPage = 20;

  const [selected,     setSelected]     = useState<WorkerComplaint | null>(null);
  const [showDetails,  setShowDetails]  = useState(false);
  const [showReview,   setShowReview]   = useState(false);
  const [reviewKey,    setReviewKey]    = useState(0);

  useEffect(() => { fetchComplaints(); }, [currentPage, statusFilter, severityFilter, categoryFilter]);
  useEffect(() => { filterComplaints(); }, [complaints, searchQuery]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: itemsPerPage.toString() });
      if (statusFilter   !== "all") params.append("status",   statusFilter);
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const res  = await fetch(`/api/worker-complaints?${params}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    if (!searchQuery) { setFiltered(complaints); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(complaints.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.company?.companyName || "").toLowerCase().includes(q) ||
      (c.worker?.fullName     || "").toLowerCase().includes(q) ||
      (c.worker?.email        || "").toLowerCase().includes(q),
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this complaint? This cannot be undone.")) return;
    try {
      const res  = await fetch(`/api/worker-complaints/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { toast.success(data.message || "Complaint deleted!"); fetchComplaints(); }
      else          toast.error(data.error || "Failed to delete complaint");
    } catch { toast.error("Failed to delete complaint. Please try again."); }
  };

  const openReview = (c: WorkerComplaint) => {
    setSelected(c); setReviewKey((k) => k + 1); setShowReview(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading complaints...</p>
      </div>
    </div>
  );

  const categoryOptions = Object.entries(WORKER_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="space-y-6">
      <ComplaintStatsCards complaints={complaints} />

      <ComplaintFilters
        searchQuery={searchQuery}      onSearchChange={setSearchQuery}
        statusFilter={statusFilter}    onStatusChange={(v) => { setStatusFilter(v);   setCurrentPage(1); }}
        severityFilter={severityFilter} onSeverityChange={(v) => { setSeverityFilter(v); setCurrentPage(1); }}
        categoryFilter={categoryFilter} onCategoryChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
        categoryOptions={categoryOptions}
      />

      <WorkerComplaintTable
        data={filtered}
        onView={(c) => { setSelected(c); setShowDetails(true); }}
        onEdit={openReview}
        onDelete={handleDelete}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} />

      <WorkerComplaintDetailsDialog
        open={showDetails} onOpenChange={setShowDetails}
        complaint={selected}
        onEdit={(c) => { setShowDetails(false); openReview(c); }}
      />

      <ComplaintReviewForm
        key={reviewKey}
        open={showReview} onOpenChange={setShowReview}
        complaintId={selected?.id || ""}
        apiBase="/api/worker-complaints"
        initialData={selected ? { status: selected.status, severity: selected.severity, adminNote: selected.adminNote, resolution: selected.resolution } : null}
        onSuccess={fetchComplaints}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company Complaints Tab — filed by workers against companies        */
/* ------------------------------------------------------------------ */

function CompanyComplaintsTab() {
  const [complaints, setComplaints] = useState<CompanyComplaint[]>([]);
  const [filtered,   setFiltered]   = useState<CompanyComplaint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const itemsPerPage = 20;

  const [selected,     setSelected]     = useState<CompanyComplaint | null>(null);
  const [showDetails,  setShowDetails]  = useState(false);
  const [showReview,   setShowReview]   = useState(false);
  const [reviewKey,    setReviewKey]    = useState(0);

  useEffect(() => { fetchComplaints(); }, [currentPage, statusFilter, severityFilter, categoryFilter]);
  useEffect(() => { filterComplaints(); }, [complaints, searchQuery]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Pass asAdmin=true so anonymous filer identity is visible to admin
      const params = new URLSearchParams({ page: currentPage.toString(), limit: itemsPerPage.toString(), asAdmin: "true" });
      if (statusFilter   !== "all") params.append("status",   statusFilter);
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const res  = await fetch(`/api/company-complaints?${params}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    if (!searchQuery) { setFiltered(complaints); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(complaints.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.company?.companyName || "").toLowerCase().includes(q) ||
      (c.worker?.fullName     || "").toLowerCase().includes(q) ||
      (c.worker?.email        || "").toLowerCase().includes(q),
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this complaint? This cannot be undone.")) return;
    try {
      const res  = await fetch(`/api/company-complaints/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { toast.success(data.message || "Complaint deleted!"); fetchComplaints(); }
      else          toast.error(data.error || "Failed to delete complaint");
    } catch { toast.error("Failed to delete complaint. Please try again."); }
  };

  const openReview = (c: CompanyComplaint) => {
    setSelected(c); setReviewKey((k) => k + 1); setShowReview(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading complaints...</p>
      </div>
    </div>
  );

  const categoryOptions = Object.entries(COMPANY_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="space-y-6">
      <ComplaintStatsCards complaints={complaints} />

      <ComplaintFilters
        searchQuery={searchQuery}      onSearchChange={setSearchQuery}
        statusFilter={statusFilter}    onStatusChange={(v) => { setStatusFilter(v);   setCurrentPage(1); }}
        severityFilter={severityFilter} onSeverityChange={(v) => { setSeverityFilter(v); setCurrentPage(1); }}
        categoryFilter={categoryFilter} onCategoryChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
        categoryOptions={categoryOptions}
      />

      <CompanyComplaintTable
        data={filtered}
        onView={(c) => { setSelected(c); setShowDetails(true); }}
        onEdit={openReview}
        onDelete={handleDelete}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} />

      <CompanyComplaintDetailsDialog
        open={showDetails} onOpenChange={setShowDetails}
        complaint={selected}
        onEdit={(c) => { setShowDetails(false); openReview(c); }}
      />

      <ComplaintReviewForm
        key={reviewKey}
        open={showReview} onOpenChange={setShowReview}
        complaintId={selected?.id || ""}
        apiBase="/api/company-complaints"
        initialData={selected ? { status: selected.status, severity: selected.severity, adminNote: selected.adminNote, resolution: selected.resolution } : null}
        onSuccess={fetchComplaints}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ComplaintsPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Complaints Management"
        description="Handle complaints between workers and companies"
      />

      <Tabs defaultValue="against-workers">
        <TabsList>
          <TabsTrigger value="against-workers">Against Workers</TabsTrigger>
          <TabsTrigger value="against-companies">Against Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="against-workers" className="mt-6">
          <WorkerComplaintsTab />
        </TabsContent>

        <TabsContent value="against-companies" className="mt-6">
          <CompanyComplaintsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SupportStatsCards,
  SupportFilters,
  WorkerTicketTable,
  CompanyTicketTable,
  WorkerTicketDetailsDialog,
  CompanyTicketDetailsDialog,
  ReplyForm,
  WORKER_CATEGORY_LABELS,
  COMPANY_CATEGORY_LABELS,
  type WorkerTicket,
  type CompanyTicket,
  type TicketStatus,
  type TicketPriority,
} from "@/components/admin/SupportComponents";

/* ------------------------------------------------------------------ */
/* Worker Tickets Tab                                                  */
/* ------------------------------------------------------------------ */

function WorkerTicketsTab() {
  const [tickets, setTickets] = useState<WorkerTicket[]>([]);
  const [filtered, setFiltered] = useState<WorkerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [selectedTicket, setSelectedTicket] = useState<WorkerTicket | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyKey, setReplyKey] = useState(0);

  useEffect(() => { fetchTickets(); }, [currentPage, statusFilter, priorityFilter, categoryFilter]);
  useEffect(() => { filterTickets(); }, [tickets, searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (statusFilter   !== "all") params.append("status",   statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const res  = await fetch(`/api/support-tickets?${params}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch {
      toast.error("Failed to load worker support tickets");
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    if (!searchQuery) { setFiltered(tickets); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(tickets.filter((t) =>
      t.subject.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q) ||
      (t.worker?.fullName || "").toLowerCase().includes(q) ||
      (t.worker?.email   || "").toLowerCase().includes(q) ||
      (t.assignedTo      || "").toLowerCase().includes(q),
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this support ticket? This cannot be undone.")) return;
    try {
      const res  = await fetch(`/api/support-tickets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Ticket deleted successfully!");
        fetchTickets();
      } else {
        toast.error(data.error || "Failed to delete ticket");
      }
    } catch {
      toast.error("Failed to delete ticket. Please try again.");
    }
  };

  const openReply = (ticket: WorkerTicket) => {
    setSelectedTicket(ticket);
    setReplyKey((k) => k + 1);
    setShowReply(true);
  };

  const categoryOptions = Object.entries(WORKER_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading worker tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SupportStatsCards tickets={tickets} />

      <SupportFilters
        searchQuery={searchQuery}      onSearchChange={setSearchQuery}
        statusFilter={statusFilter}    onStatusChange={(v) => { setStatusFilter(v);   setCurrentPage(1); }}
        priorityFilter={priorityFilter} onPriorityChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}
        categoryFilter={categoryFilter} onCategoryChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
        categoryOptions={categoryOptions}
      />

      <WorkerTicketTable
        data={filtered}
        onView={(t) => { setSelectedTicket(t); setShowDetails(true); }}
        onReply={openReply}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <WorkerTicketDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        ticket={selectedTicket}
        onReply={(t) => { setShowDetails(false); openReply(t); }}
      />

      <ReplyForm
        key={replyKey}
        open={showReply}
        onOpenChange={setShowReply}
        ticketId={selectedTicket?.id || ""}
        apiBase="/api/support-tickets"
        initialData={selectedTicket ? {
          subject:    selectedTicket.subject,
          status:     selectedTicket.status,
          priority:   selectedTicket.priority,
          assignedTo: selectedTicket.assignedTo,
          adminReply: selectedTicket.adminReply,
        } : null}
        onSuccess={fetchTickets}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company Tickets Tab                                                 */
/* ------------------------------------------------------------------ */

function CompanyTicketsTab() {
  const [tickets, setTickets] = useState<CompanyTicket[]>([]);
  const [filtered, setFiltered] = useState<CompanyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [selectedTicket, setSelectedTicket] = useState<CompanyTicket | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyKey, setReplyKey] = useState(0);

  useEffect(() => { fetchTickets(); }, [currentPage, statusFilter, priorityFilter, categoryFilter]);
  useEffect(() => { filterTickets(); }, [tickets, searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (statusFilter   !== "all") params.append("status",   statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const res  = await fetch(`/api/company-support?${params}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch {
      toast.error("Failed to load company support tickets");
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    if (!searchQuery) { setFiltered(tickets); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(tickets.filter((t) =>
      t.subject.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q) ||
      (t.company?.companyName || "").toLowerCase().includes(q) ||
      (t.company?.industry    || "").toLowerCase().includes(q) ||
      (t.assignedTo           || "").toLowerCase().includes(q),
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this support ticket? This cannot be undone.")) return;
    try {
      const res  = await fetch(`/api/company-support/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Ticket deleted successfully!");
        fetchTickets();
      } else {
        toast.error(data.error || "Failed to delete ticket");
      }
    } catch {
      toast.error("Failed to delete ticket. Please try again.");
    }
  };

  const openReply = (ticket: CompanyTicket) => {
    setSelectedTicket(ticket);
    setReplyKey((k) => k + 1);
    setShowReply(true);
  };

  const categoryOptions = Object.entries(COMPANY_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading company tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SupportStatsCards tickets={tickets} />

      <SupportFilters
        searchQuery={searchQuery}      onSearchChange={setSearchQuery}
        statusFilter={statusFilter}    onStatusChange={(v) => { setStatusFilter(v);   setCurrentPage(1); }}
        priorityFilter={priorityFilter} onPriorityChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}
        categoryFilter={categoryFilter} onCategoryChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
        categoryOptions={categoryOptions}
      />

      <CompanyTicketTable
        data={filtered}
        onView={(t) => { setSelectedTicket(t); setShowDetails(true); }}
        onReply={openReply}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <CompanyTicketDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        ticket={selectedTicket}
        onReply={(t) => { setShowDetails(false); openReply(t); }}
      />

      <ReplyForm
        key={replyKey}
        open={showReply}
        onOpenChange={setShowReply}
        ticketId={selectedTicket?.id || ""}
        apiBase="/api/company-support"
        initialData={selectedTicket ? {
          subject:    selectedTicket.subject,
          status:     selectedTicket.status,
          priority:   selectedTicket.priority,
          assignedTo: selectedTicket.assignedTo,
          adminReply: selectedTicket.adminReply,
        } : null}
        onSuccess={fetchTickets}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Support Tickets"
        description="Manage support requests from workers and companies"
      />

      <Tabs defaultValue="workers">
        <TabsList>
          <TabsTrigger value="workers">Worker Tickets</TabsTrigger>
          <TabsTrigger value="companies">Company Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="mt-6">
          <WorkerTicketsTab />
        </TabsContent>

        <TabsContent value="companies" className="mt-6">
          <CompanyTicketsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

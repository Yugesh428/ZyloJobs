"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit, Trash2, MessageSquareReply } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type WorkerTicketCategory =
  | "account" | "job" | "onboarding" | "attendance"
  | "payment" | "technical" | "other";

export type CompanyTicketCategory =
  | "billing" | "worker_quality" | "staffing" | "onboarding"
  | "platform" | "account" | "other";

export interface WorkerTicket {
  id: string;
  workerId: string;
  subject: string;
  message: string;
  category: WorkerTicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  adminReply: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  worker?: { id: string; fullName: string; email: string };
}

export interface CompanyTicket {
  id: string;
  companyId: string;
  subject: string;
  message: string;
  category: CompanyTicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  adminReply: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: string; companyName: string; companyCode: string; industry: string };
}

/* ------------------------------------------------------------------ */
/* Config maps                                                         */
/* ------------------------------------------------------------------ */

export const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; variant: "success" | "secondary" | "warning" | "destructive"; statClass: string }
> = {
  open:        { label: "Open",        variant: "warning",     statClass: "text-amber-600"  },
  in_progress: { label: "In Progress", variant: "secondary",   statClass: "text-blue-600"   },
  resolved:    { label: "Resolved",    variant: "success",     statClass: "text-success"    },
  closed:      { label: "Closed",      variant: "destructive", statClass: "text-muted-foreground" },
};

export const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; variant: "success" | "secondary" | "warning" | "destructive" }
> = {
  low:    { label: "Low",    variant: "secondary"   },
  medium: { label: "Medium", variant: "warning"     },
  high:   { label: "High",   variant: "destructive" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export const WORKER_CATEGORY_LABELS: Record<WorkerTicketCategory, string> = {
  account:    "Account",
  job:        "Job",
  onboarding: "Onboarding",
  attendance: "Attendance",
  payment:    "Payment",
  technical:  "Technical",
  other:      "Other",
};

export const COMPANY_CATEGORY_LABELS: Record<CompanyTicketCategory, string> = {
  billing:        "Billing",
  worker_quality: "Worker Quality",
  staffing:       "Staffing",
  onboarding:     "Onboarding",
  platform:       "Platform",
  account:        "Account",
  other:          "Other",
};

export const STATUS_OPTIONS: TicketStatus[]  = ["open", "in_progress", "resolved", "closed"];
export const PRIORITY_OPTIONS: TicketPriority[] = ["low", "medium", "high", "urgent"];
export const WORKER_CATEGORY_OPTIONS: WorkerTicketCategory[] = [
  "account", "job", "onboarding", "attendance", "payment", "technical", "other",
];
export const COMPANY_CATEGORY_OPTIONS: CompanyTicketCategory[] = [
  "billing", "worker_quality", "staffing", "onboarding", "platform", "account", "other",
];

export function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/* ------------------------------------------------------------------ */
/* StatsCards — works for both ticket types                           */
/* ------------------------------------------------------------------ */

interface StatsCardsProps {
  tickets: Array<{ status: TicketStatus; priority: TicketPriority }>;
}

export function SupportStatsCards({ tickets }: StatsCardsProps) {
  const stats = {
    total:       tickets.length,
    open:        tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved:    tickets.filter((t) => t.status === "resolved").length,
    closed:      tickets.filter((t) => t.status === "closed").length,
    urgent:      tickets.filter((t) => t.priority === "urgent").length,
    high:        tickets.filter((t) => t.priority === "high").length,
  };

  const cards = [
    { label: "Total",       value: stats.total,       cls: "" },
    { label: "Open",        value: stats.open,        cls: STATUS_CONFIG.open.statClass },
    { label: "In Progress", value: stats.in_progress, cls: STATUS_CONFIG.in_progress.statClass },
    { label: "Resolved",    value: stats.resolved,    cls: STATUS_CONFIG.resolved.statClass },
    { label: "Closed",      value: stats.closed,      cls: STATUS_CONFIG.closed.statClass },
    { label: "Urgent",      value: stats.urgent,      cls: "text-destructive" },
    { label: "High",        value: stats.high,        cls: "text-orange-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-7">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${c.cls}`}>{c.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SupportFilters                                                      */
/* ------------------------------------------------------------------ */

interface SupportFiltersProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  priorityFilter: string;
  onPriorityChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  categoryOptions: { value: string; label: string }[];
}

export function SupportFilters({
  searchQuery, onSearchChange,
  statusFilter, onStatusChange,
  priorityFilter, onPriorityChange,
  categoryFilter, onCategoryChange,
  categoryOptions,
}: SupportFiltersProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Filter Tickets</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger><SelectValue placeholder="All Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {PRIORITY_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger><SelectValue placeholder="All Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Category</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* WorkerTicketTable                                                   */
/* ------------------------------------------------------------------ */

interface WorkerTicketTableProps {
  data: WorkerTicket[];
  onView: (t: WorkerTicket) => void;
  onReply: (t: WorkerTicket) => void;
  onDelete: (id: string) => void;
}

export function WorkerTicketTable({
  data, onView, onReply, onDelete,
}: WorkerTicketTableProps) {
  const columns = [
    {
      header: "Worker",
      accessor: (row: WorkerTicket) => (
        <div>
          <p className="font-medium">{row.worker?.fullName || shortId(row.workerId)}</p>
          <p className="text-xs text-muted-foreground">{row.worker?.email || "—"}</p>
        </div>
      ),
    },
    {
      header: "Subject",
      accessor: (row: WorkerTicket) => (
        <div>
          <p className="text-sm font-medium line-clamp-1">{row.subject}</p>
          <p className="text-xs text-muted-foreground">
            {WORKER_CATEGORY_LABELS[row.category]}
          </p>
        </div>
      ),
    },
    {
      header: "Priority",
      accessor: (row: WorkerTicket) => (
        <StatusBadge status={PRIORITY_CONFIG[row.priority].label} variant={PRIORITY_CONFIG[row.priority].variant} />
      ),
    },
    {
      header: "Status",
      accessor: (row: WorkerTicket) => (
        <StatusBadge status={STATUS_CONFIG[row.status].label} variant={STATUS_CONFIG[row.status].variant} />
      ),
    },
    {
      header: "Assigned To",
      accessor: (row: WorkerTicket) => (
        <p className="text-sm text-muted-foreground">{row.assignedTo || "—"}</p>
      ),
    },
    {
      header: "Created",
      accessor: (row: WorkerTicket) => (
        <p className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </p>
      ),
    },
    {
      header: "Actions",
      accessor: (row: WorkerTicket) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onReply(row)} title="Reply / Update">
            <MessageSquareReply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable data={data} columns={columns} emptyMessage="No worker support tickets found" />
  );
}

/* ------------------------------------------------------------------ */
/* CompanyTicketTable                                                  */
/* ------------------------------------------------------------------ */

interface CompanyTicketTableProps {
  data: CompanyTicket[];
  onView: (t: CompanyTicket) => void;
  onReply: (t: CompanyTicket) => void;
  onDelete: (id: string) => void;
}

export function CompanyTicketTable({
  data, onView, onReply, onDelete,
}: CompanyTicketTableProps) {
  const columns = [
    {
      header: "Company",
      accessor: (row: CompanyTicket) => (
        <div>
          <p className="font-medium">{row.company?.companyName || shortId(row.companyId)}</p>
          <p className="text-xs text-muted-foreground">{row.company?.industry || "—"}</p>
        </div>
      ),
    },
    {
      header: "Subject",
      accessor: (row: CompanyTicket) => (
        <div>
          <p className="text-sm font-medium line-clamp-1">{row.subject}</p>
          <p className="text-xs text-muted-foreground">
            {COMPANY_CATEGORY_LABELS[row.category]}
          </p>
        </div>
      ),
    },
    {
      header: "Priority",
      accessor: (row: CompanyTicket) => (
        <StatusBadge status={PRIORITY_CONFIG[row.priority].label} variant={PRIORITY_CONFIG[row.priority].variant} />
      ),
    },
    {
      header: "Status",
      accessor: (row: CompanyTicket) => (
        <StatusBadge status={STATUS_CONFIG[row.status].label} variant={STATUS_CONFIG[row.status].variant} />
      ),
    },
    {
      header: "Assigned To",
      accessor: (row: CompanyTicket) => (
        <p className="text-sm text-muted-foreground">{row.assignedTo || "—"}</p>
      ),
    },
    {
      header: "Created",
      accessor: (row: CompanyTicket) => (
        <p className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </p>
      ),
    },
    {
      header: "Actions",
      accessor: (row: CompanyTicket) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onReply(row)} title="Reply / Update">
            <MessageSquareReply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable data={data} columns={columns} emptyMessage="No company support tickets found" />
  );
}

/* ------------------------------------------------------------------ */
/* WorkerTicketDetailsDialog                                           */
/* ------------------------------------------------------------------ */

interface WorkerTicketDetailsProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticket: WorkerTicket | null;
  onReply: (t: WorkerTicket) => void;
}

export function WorkerTicketDetailsDialog({
  open, onOpenChange, ticket, onReply,
}: WorkerTicketDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Worker Support Ticket</DialogTitle>
          <DialogDescription>Ticket details and thread</DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Worker</Label>
                <p className="text-sm font-medium mt-1">{ticket.worker?.fullName || shortId(ticket.workerId)}</p>
                {ticket.worker?.email && (
                  <p className="text-xs text-muted-foreground">{ticket.worker.email}</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-sm font-medium mt-1">{WORKER_CATEGORY_LABELS[ticket.category]}</p>
              </div>
              <div>
                <Label>Priority</Label>
                <div className="mt-1">
                  <StatusBadge status={PRIORITY_CONFIG[ticket.priority].label} variant={PRIORITY_CONFIG[ticket.priority].variant} />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge status={STATUS_CONFIG[ticket.status].label} variant={STATUS_CONFIG[ticket.status].variant} />
                </div>
              </div>
              {ticket.assignedTo && (
                <div>
                  <Label>Assigned To</Label>
                  <p className="text-sm font-medium mt-1">{ticket.assignedTo}</p>
                </div>
              )}
              {ticket.resolvedAt && (
                <div>
                  <Label>Resolved At</Label>
                  <p className="text-sm font-medium mt-1">{new Date(ticket.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <Label>Subject</Label>
              <p className="text-sm font-medium mt-1">{ticket.subject}</p>
            </div>

            <div className="pt-2 border-t">
              <Label>Message from Worker</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{ticket.message}</p>
            </div>

            {ticket.adminReply && (
              <div className="pt-2 border-t">
                <Label>Admin Reply</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-primary/5 rounded-lg p-3">{ticket.adminReply}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t text-xs text-muted-foreground">
              <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {ticket && (
            <Button onClick={() => { onOpenChange(false); onReply(ticket); }}>
              <MessageSquareReply className="mr-2 h-4 w-4" />
              Reply / Update
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* CompanyTicketDetailsDialog                                          */
/* ------------------------------------------------------------------ */

interface CompanyTicketDetailsProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticket: CompanyTicket | null;
  onReply: (t: CompanyTicket) => void;
}

export function CompanyTicketDetailsDialog({
  open, onOpenChange, ticket, onReply,
}: CompanyTicketDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Support Ticket</DialogTitle>
          <DialogDescription>Ticket details and thread</DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Company</Label>
                <p className="text-sm font-medium mt-1">{ticket.company?.companyName || shortId(ticket.companyId)}</p>
                {ticket.company?.industry && (
                  <p className="text-xs text-muted-foreground">{ticket.company.industry}</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-sm font-medium mt-1">{COMPANY_CATEGORY_LABELS[ticket.category]}</p>
              </div>
              <div>
                <Label>Priority</Label>
                <div className="mt-1">
                  <StatusBadge status={PRIORITY_CONFIG[ticket.priority].label} variant={PRIORITY_CONFIG[ticket.priority].variant} />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge status={STATUS_CONFIG[ticket.status].label} variant={STATUS_CONFIG[ticket.status].variant} />
                </div>
              </div>
              {ticket.assignedTo && (
                <div>
                  <Label>Assigned To</Label>
                  <p className="text-sm font-medium mt-1">{ticket.assignedTo}</p>
                </div>
              )}
              {ticket.resolvedAt && (
                <div>
                  <Label>Resolved At</Label>
                  <p className="text-sm font-medium mt-1">{new Date(ticket.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <Label>Subject</Label>
              <p className="text-sm font-medium mt-1">{ticket.subject}</p>
            </div>

            <div className="pt-2 border-t">
              <Label>Message from Company</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{ticket.message}</p>
            </div>

            {ticket.adminReply && (
              <div className="pt-2 border-t">
                <Label>Admin Reply</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-primary/5 rounded-lg p-3">{ticket.adminReply}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t text-xs text-muted-foreground">
              <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {ticket && (
            <Button onClick={() => { onOpenChange(false); onReply(ticket); }}>
              <MessageSquareReply className="mr-2 h-4 w-4" />
              Reply / Update
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* ReplyForm — used for both worker and company tickets               */
/* ------------------------------------------------------------------ */

interface ReplyFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticketId: string;
  apiBase: string; // "/api/support-tickets" or "/api/company-support"
  initialData: {
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo: string | null;
    adminReply: string | null;
  } | null;
  onSuccess: () => void;
}

export function ReplyForm({
  open, onOpenChange, ticketId, apiBase, initialData, onSuccess,
}: ReplyFormProps) {
  const [status, setStatus] = useState<TicketStatus>("open");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setAssignedTo(initialData.assignedTo || "");
      setAdminReply(initialData.adminReply || "");
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority,
          assignedTo: assignedTo.trim() || null,
          adminReply: adminReply.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Ticket updated successfully!");
        onOpenChange(false);
        onSuccess();
      } else {
        const msg = data.error || "Failed to update ticket";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Failed to update ticket. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reply & Update Ticket</DialogTitle>
          <DialogDescription>
            Update status, assign to an admin, and send a reply.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign To (admin name)</Label>
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. John Admin"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Reply</Label>
            <Textarea
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="Write your reply to the user..."
              rows={4}
              disabled={loading}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

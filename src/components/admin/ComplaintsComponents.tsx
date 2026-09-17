"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ComplaintStatus   = "open" | "under_review" | "resolved" | "dismissed";
export type ComplaintSeverity = "low" | "medium" | "high" | "critical";

export type WorkerComplaintCategory =
  | "attendance" | "misconduct" | "performance"
  | "policy_violation" | "damage" | "other";

export type CompanyComplaintCategory =
  | "harassment" | "unsafe_conditions" | "overwork"
  | "discrimination" | "contract_violation" | "other";

export interface WorkerComplaint {
  id: string;
  companyId: string;
  workerId: string;
  onboardingId: string;
  title: string;
  description: string;
  category: WorkerComplaintCategory;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  adminNote: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: string; companyName: string; companyCode: string; industry: string };
  worker?:  { id: string; fullName: string; email: string };
}

export interface CompanyComplaint {
  id: string;
  workerId: string;
  companyId: string;
  onboardingId: string;
  title: string;
  description: string;
  category: CompanyComplaintCategory;
  severity: ComplaintSeverity;
  isAnonymous: boolean;
  status: ComplaintStatus;
  adminNote: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  worker?:  { id: string; fullName: string; email: string } | null;
  company?: { id: string; companyName: string; companyCode: string; industry: string };
}

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export const STATUS_CONFIG: Record<ComplaintStatus, {
  label: string;
  variant: "success" | "secondary" | "warning" | "destructive";
  statClass: string;
}> = {
  open:         { label: "Open",         variant: "warning",     statClass: "text-amber-600"       },
  under_review: { label: "Under Review", variant: "secondary",   statClass: "text-blue-600"        },
  resolved:     { label: "Resolved",     variant: "success",     statClass: "text-success"         },
  dismissed:    { label: "Dismissed",    variant: "destructive", statClass: "text-muted-foreground" },
};

export const SEVERITY_CONFIG: Record<ComplaintSeverity, {
  label: string;
  variant: "success" | "secondary" | "warning" | "destructive";
}> = {
  low:      { label: "Low",      variant: "secondary"   },
  medium:   { label: "Medium",   variant: "warning"     },
  high:     { label: "High",     variant: "destructive" },
  critical: { label: "Critical", variant: "destructive" },
};

export const WORKER_CATEGORY_LABELS: Record<WorkerComplaintCategory, string> = {
  attendance:       "Attendance",
  misconduct:       "Misconduct",
  performance:      "Performance",
  policy_violation: "Policy Violation",
  damage:           "Damage",
  other:            "Other",
};

export const COMPANY_CATEGORY_LABELS: Record<CompanyComplaintCategory, string> = {
  harassment:        "Harassment",
  unsafe_conditions: "Unsafe Conditions",
  overwork:          "Overwork",
  discrimination:    "Discrimination",
  contract_violation:"Contract Violation",
  other:             "Other",
};

export const STATUS_OPTIONS:   ComplaintStatus[]   = ["open","under_review","resolved","dismissed"];
export const SEVERITY_OPTIONS: ComplaintSeverity[] = ["low","medium","high","critical"];
export const WORKER_CATEGORY_OPTIONS:  WorkerComplaintCategory[]  = ["attendance","misconduct","performance","policy_violation","damage","other"];
export const COMPANY_CATEGORY_OPTIONS: CompanyComplaintCategory[] = ["harassment","unsafe_conditions","overwork","discrimination","contract_violation","other"];

export function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/* ------------------------------------------------------------------ */
/* ComplaintStatsCards                                                 */
/* ------------------------------------------------------------------ */

interface StatsCardsProps {
  complaints: Array<{ status: ComplaintStatus; severity: ComplaintSeverity }>;
}

export function ComplaintStatsCards({ complaints }: StatsCardsProps) {
  const s = {
    total:        complaints.length,
    open:         complaints.filter((c) => c.status === "open").length,
    under_review: complaints.filter((c) => c.status === "under_review").length,
    resolved:     complaints.filter((c) => c.status === "resolved").length,
    dismissed:    complaints.filter((c) => c.status === "dismissed").length,
    critical:     complaints.filter((c) => c.severity === "critical").length,
    high:         complaints.filter((c) => c.severity === "high").length,
  };

  const cards = [
    { label: "Total",        value: s.total,        cls: "" },
    { label: "Open",         value: s.open,         cls: STATUS_CONFIG.open.statClass },
    { label: "Under Review", value: s.under_review, cls: STATUS_CONFIG.under_review.statClass },
    { label: "Resolved",     value: s.resolved,     cls: STATUS_CONFIG.resolved.statClass },
    { label: "Dismissed",    value: s.dismissed,    cls: STATUS_CONFIG.dismissed.statClass },
    { label: "Critical",     value: s.critical,     cls: "text-destructive" },
    { label: "High",         value: s.high,         cls: "text-orange-600" },
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
/* ComplaintFilters                                                    */
/* ------------------------------------------------------------------ */

interface FiltersProps {
  searchQuery: string;   onSearchChange: (v: string) => void;
  statusFilter: string;  onStatusChange: (v: string) => void;
  severityFilter: string; onSeverityChange: (v: string) => void;
  categoryFilter: string; onCategoryChange: (v: string) => void;
  categoryOptions: { value: string; label: string }[];
}

export function ComplaintFilters({
  searchQuery, onSearchChange,
  statusFilter, onStatusChange,
  severityFilter, onSeverityChange,
  categoryFilter, onCategoryChange,
  categoryOptions,
}: FiltersProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Filter Complaints</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
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

        <Select value={severityFilter} onValueChange={onSeverityChange}>
          <SelectTrigger><SelectValue placeholder="All Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {SEVERITY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{SEVERITY_CONFIG[s].label}</SelectItem>
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
/* WorkerComplaintTable  (company filed against worker)               */
/* ------------------------------------------------------------------ */

interface WorkerComplaintTableProps {
  data: WorkerComplaint[];
  onView: (c: WorkerComplaint) => void;
  onEdit: (c: WorkerComplaint) => void;
  onDelete: (id: string) => void;
}

export function WorkerComplaintTable({ data, onView, onEdit, onDelete }: WorkerComplaintTableProps) {
  const columns = [
    {
      header: "Filed By (Company)",
      accessor: (row: WorkerComplaint) => (
        <div>
          <p className="font-medium">{row.company?.companyName || shortId(row.companyId)}</p>
          <p className="text-xs text-muted-foreground">{row.company?.industry || "—"}</p>
        </div>
      ),
    },
    {
      header: "Against (Worker)",
      accessor: (row: WorkerComplaint) => (
        <div>
          <p className="text-sm font-medium">{row.worker?.fullName || shortId(row.workerId)}</p>
          <p className="text-xs text-muted-foreground">{row.worker?.email || "—"}</p>
        </div>
      ),
    },
    {
      header: "Title / Category",
      accessor: (row: WorkerComplaint) => (
        <div>
          <p className="text-sm font-medium line-clamp-1">{row.title}</p>
          <p className="text-xs text-muted-foreground">{WORKER_CATEGORY_LABELS[row.category]}</p>
        </div>
      ),
    },
    {
      header: "Severity",
      accessor: (row: WorkerComplaint) => (
        <StatusBadge status={SEVERITY_CONFIG[row.severity].label} variant={SEVERITY_CONFIG[row.severity].variant} />
      ),
    },
    {
      header: "Status",
      accessor: (row: WorkerComplaint) => (
        <StatusBadge status={STATUS_CONFIG[row.status].label} variant={STATUS_CONFIG[row.status].variant} />
      ),
    },
    {
      header: "Date",
      accessor: (row: WorkerComplaint) => (
        <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</p>
      ),
    },
    {
      header: "Actions",
      accessor: (row: WorkerComplaint) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(row)} title="View"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(row)} title="Review"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];
  return <DataTable data={data} columns={columns} emptyMessage="No complaints against workers found" />;
}

/* ------------------------------------------------------------------ */
/* CompanyComplaintTable  (worker filed against company)              */
/* ------------------------------------------------------------------ */

interface CompanyComplaintTableProps {
  data: CompanyComplaint[];
  onView: (c: CompanyComplaint) => void;
  onEdit: (c: CompanyComplaint) => void;
  onDelete: (id: string) => void;
}

export function CompanyComplaintTable({ data, onView, onEdit, onDelete }: CompanyComplaintTableProps) {
  const columns = [
    {
      header: "Filed By (Worker)",
      accessor: (row: CompanyComplaint) => (
        <div>
          {row.isAnonymous && !row.worker ? (
            <p className="text-sm font-medium italic text-muted-foreground">Anonymous</p>
          ) : (
            <>
              <p className="font-medium">{row.worker?.fullName || shortId(row.workerId)}</p>
              <p className="text-xs text-muted-foreground">{row.worker?.email || "—"}</p>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Against (Company)",
      accessor: (row: CompanyComplaint) => (
        <div>
          <p className="text-sm font-medium">{row.company?.companyName || shortId(row.companyId)}</p>
          <p className="text-xs text-muted-foreground">{row.company?.industry || "—"}</p>
        </div>
      ),
    },
    {
      header: "Title / Category",
      accessor: (row: CompanyComplaint) => (
        <div>
          <p className="text-sm font-medium line-clamp-1">{row.title}</p>
          <p className="text-xs text-muted-foreground">{COMPANY_CATEGORY_LABELS[row.category]}</p>
        </div>
      ),
    },
    {
      header: "Severity",
      accessor: (row: CompanyComplaint) => (
        <StatusBadge status={SEVERITY_CONFIG[row.severity].label} variant={SEVERITY_CONFIG[row.severity].variant} />
      ),
    },
    {
      header: "Status",
      accessor: (row: CompanyComplaint) => (
        <StatusBadge status={STATUS_CONFIG[row.status].label} variant={STATUS_CONFIG[row.status].variant} />
      ),
    },
    {
      header: "Anon",
      accessor: (row: CompanyComplaint) => (
        <p className="text-xs text-center">{row.isAnonymous ? "🔒" : "—"}</p>
      ),
    },
    {
      header: "Date",
      accessor: (row: CompanyComplaint) => (
        <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</p>
      ),
    },
    {
      header: "Actions",
      accessor: (row: CompanyComplaint) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(row)} title="View"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(row)} title="Review"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];
  return <DataTable data={data} columns={columns} emptyMessage="No complaints against companies found" />;
}

/* ------------------------------------------------------------------ */
/* WorkerComplaintDetailsDialog                                        */
/* ------------------------------------------------------------------ */

interface WorkerComplaintDetailsProps {
  open: boolean; onOpenChange: (v: boolean) => void;
  complaint: WorkerComplaint | null;
  onEdit: (c: WorkerComplaint) => void;
}

export function WorkerComplaintDetailsDialog({ open, onOpenChange, complaint, onEdit }: WorkerComplaintDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complaint Against Worker</DialogTitle>
          <DialogDescription>Filed by a company against a placed worker</DialogDescription>
        </DialogHeader>

        {complaint && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Filed By (Company)</Label>
                <p className="text-sm font-medium mt-1">{complaint.company?.companyName || shortId(complaint.companyId)}</p>
                <p className="text-xs text-muted-foreground">{complaint.company?.industry}</p>
              </div>
              <div>
                <Label>Against (Worker)</Label>
                <p className="text-sm font-medium mt-1">{complaint.worker?.fullName || shortId(complaint.workerId)}</p>
                <p className="text-xs text-muted-foreground">{complaint.worker?.email}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-sm font-medium mt-1">{WORKER_CATEGORY_LABELS[complaint.category]}</p>
              </div>
              <div>
                <Label>Severity</Label>
                <div className="mt-1">
                  <StatusBadge status={SEVERITY_CONFIG[complaint.severity].label} variant={SEVERITY_CONFIG[complaint.severity].variant} />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge status={STATUS_CONFIG[complaint.status].label} variant={STATUS_CONFIG[complaint.status].variant} />
                </div>
              </div>
              {complaint.resolvedAt && (
                <div>
                  <Label>Resolved At</Label>
                  <p className="text-sm font-medium mt-1">{new Date(complaint.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <Label>Title</Label>
              <p className="text-sm font-medium mt-1">{complaint.title}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{complaint.description}</p>
            </div>
            {complaint.adminNote && (
              <div className="pt-2 border-t">
                <Label>Admin Note</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-primary/5 rounded-lg p-3">{complaint.adminNote}</p>
              </div>
            )}
            {complaint.resolution && (
              <div>
                <Label>Resolution</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-success/5 rounded-lg p-3">{complaint.resolution}</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t text-xs text-muted-foreground">
              <span>Created: {new Date(complaint.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {complaint && (
            <Button onClick={() => { onOpenChange(false); onEdit(complaint); }}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Review
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* CompanyComplaintDetailsDialog                                       */
/* ------------------------------------------------------------------ */

interface CompanyComplaintDetailsProps {
  open: boolean; onOpenChange: (v: boolean) => void;
  complaint: CompanyComplaint | null;
  onEdit: (c: CompanyComplaint) => void;
}

export function CompanyComplaintDetailsDialog({ open, onOpenChange, complaint, onEdit }: CompanyComplaintDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complaint Against Company</DialogTitle>
          <DialogDescription>Filed by a worker against a company</DialogDescription>
        </DialogHeader>

        {complaint && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Filed By (Worker)</Label>
                {complaint.isAnonymous && !complaint.worker ? (
                  <p className="text-sm font-medium mt-1 italic text-muted-foreground">🔒 Anonymous</p>
                ) : (
                  <>
                    <p className="text-sm font-medium mt-1">{complaint.worker?.fullName || shortId(complaint.workerId)}</p>
                    <p className="text-xs text-muted-foreground">{complaint.worker?.email}</p>
                  </>
                )}
              </div>
              <div>
                <Label>Against (Company)</Label>
                <p className="text-sm font-medium mt-1">{complaint.company?.companyName || shortId(complaint.companyId)}</p>
                <p className="text-xs text-muted-foreground">{complaint.company?.industry}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-sm font-medium mt-1">{COMPANY_CATEGORY_LABELS[complaint.category]}</p>
              </div>
              <div>
                <Label>Severity</Label>
                <div className="mt-1">
                  <StatusBadge status={SEVERITY_CONFIG[complaint.severity].label} variant={SEVERITY_CONFIG[complaint.severity].variant} />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge status={STATUS_CONFIG[complaint.status].label} variant={STATUS_CONFIG[complaint.status].variant} />
                </div>
              </div>
              {complaint.resolvedAt && (
                <div>
                  <Label>Resolved At</Label>
                  <p className="text-sm font-medium mt-1">{new Date(complaint.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <Label>Title</Label>
              <p className="text-sm font-medium mt-1">{complaint.title}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{complaint.description}</p>
            </div>
            {complaint.adminNote && (
              <div className="pt-2 border-t">
                <Label>Admin Note</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-primary/5 rounded-lg p-3">{complaint.adminNote}</p>
              </div>
            )}
            {complaint.resolution && (
              <div>
                <Label>Resolution</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-success/5 rounded-lg p-3">{complaint.resolution}</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t text-xs text-muted-foreground">
              <span>Created: {new Date(complaint.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {complaint && (
            <Button onClick={() => { onOpenChange(false); onEdit(complaint); }}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Review
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* ComplaintReviewForm — admin updates status, note, resolution       */
/* ------------------------------------------------------------------ */

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  complaintId: string;
  apiBase: string;
  initialData: {
    status: ComplaintStatus;
    severity: ComplaintSeverity;
    adminNote: string | null;
    resolution: string | null;
  } | null;
  onSuccess: () => void;
}

export function ComplaintReviewForm({
  open, onOpenChange, complaintId, apiBase, initialData, onSuccess,
}: ReviewFormProps) {
  const [status,     setStatus]     = useState<ComplaintStatus>("open");
  const [severity,   setSeverity]   = useState<ComplaintSeverity>("medium");
  const [adminNote,  setAdminNote]  = useState("");
  const [resolution, setResolution] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setStatus(initialData.status);
      setSeverity(initialData.severity);
      setAdminNote(initialData.adminNote || "");
      setResolution(initialData.resolution || "");
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          severity,
          adminNote:  adminNote.trim()  || null,
          resolution: resolution.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Complaint updated successfully!");
        onOpenChange(false);
        onSuccess();
      } else {
        const msg = data.error || "Failed to update complaint";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Failed to update complaint. Please try again.";
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
          <DialogTitle>Review Complaint</DialogTitle>
          <DialogDescription>Update status, add admin notes, and write a resolution.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus)} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as ComplaintSeverity)} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{SEVERITY_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Admin Note (internal)</Label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Internal notes about the investigation..."
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Resolution (shared with parties)</Label>
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how this complaint was resolved..."
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

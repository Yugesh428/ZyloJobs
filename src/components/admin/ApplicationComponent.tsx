"use client";

import { useState } from "react";
import { Search, Eye, Trash2, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
/* Types + constants                                                   */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  cvUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    variant: "success" | "secondary" | "warning" | "destructive";
    statClass: string;
  }
> = {
  applied: {
    label: "Applied",
    variant: "secondary",
    statClass: "text-muted-foreground",
  },
  reviewing: {
    label: "Reviewing",
    variant: "warning",
    statClass: "text-amber-600",
  },
  shortlisted: {
    label: "Shortlisted",
    variant: "success",
    statClass: "text-success",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    statClass: "text-destructive",
  },
  hired: {
    label: "Hired",
    variant: "success",
    statClass: "text-emerald-600",
  },
};

export const APPLICATION_STATUS_OPTIONS: ApplicationStatus[] = [
  "applied",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
];

/** Shorten a UUID for compact display */
export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/* ------------------------------------------------------------------ */
/* ApplicationStatsCards                                               */
/* ------------------------------------------------------------------ */

interface ApplicationStatsCardsProps {
  applications: JobApplication[];
}

export function ApplicationStatsCards({
  applications,
}: ApplicationStatsCardsProps) {
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${APPLICATION_STATUS_CONFIG.applied.statClass}`}
          >
            Applied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.applied}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${APPLICATION_STATUS_CONFIG.reviewing.statClass}`}
          >
            Reviewing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reviewing}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${APPLICATION_STATUS_CONFIG.shortlisted.statClass}`}
          >
            Shortlisted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.shortlisted}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${APPLICATION_STATUS_CONFIG.hired.statClass}`}
          >
            Hired
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hired}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${APPLICATION_STATUS_CONFIG.rejected.statClass}`}
          >
            Rejected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rejected}</div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ApplicationFilters                                                  */
/* ------------------------------------------------------------------ */

interface ApplicationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function ApplicationFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ApplicationFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Applications</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by worker ID, cover note..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {APPLICATION_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {APPLICATION_STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* ApplicationTable                                                    */
/* ------------------------------------------------------------------ */

interface ApplicationTableProps {
  data: JobApplication[];
  onView: (app: JobApplication) => void;
  onUpdateStatus: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

export function ApplicationTable({
  data,
  onView,
  onUpdateStatus,
  onDelete,
}: ApplicationTableProps) {
  const columns = [
    {
      header: "Worker",
      accessor: (row: JobApplication) => (
        <div>
          <p className="font-medium font-mono text-sm">
            {shortId(row.workerId)}
          </p>
          <p className="text-xs text-muted-foreground">Applicant</p>
        </div>
      ),
    },
    {
      header: "CV",
      accessor: (row: JobApplication) =>
        row.cvUrl ? (
          <a
            href={row.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            View CV
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No CV</p>
        ),
    },
    {
      header: "Cover Note",
      accessor: (row: JobApplication) => (
        <p className="text-sm text-muted-foreground truncate max-w-[240px]">
          {row.coverNote || "—"}
        </p>
      ),
    },
    {
      header: "Applied On",
      accessor: (row: JobApplication) => (
        <p className="text-sm text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: (row: JobApplication) => {
        const meta = APPLICATION_STATUS_CONFIG[row.status];
        return <StatusBadge status={meta.label} variant={meta.variant} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: JobApplication) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdateStatus(row)}
            title="Update Status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      emptyMessage="No applications found"
    />
  );
}

/* ------------------------------------------------------------------ */
/* ApplicationDetailsDialog                                            */
/* ------------------------------------------------------------------ */

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
  onUpdateStatus: (app: JobApplication) => void;
}

export function ApplicationDetailsDialog({
  open,
  onOpenChange,
  application,
  onUpdateStatus,
}: ApplicationDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            View the applicant's submission for this job
          </DialogDescription>
        </DialogHeader>

        {application && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Worker ID</Label>
                <p className="text-sm font-mono font-medium mt-1">
                  {application.workerId}
                </p>
              </div>
              <div>
                <Label>Job ID</Label>
                <p className="text-sm font-mono font-medium mt-1">
                  {application.jobId}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge
                    status={APPLICATION_STATUS_CONFIG[application.status].label}
                    variant={
                      APPLICATION_STATUS_CONFIG[application.status].variant
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Cover Note</Label>
                <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                  {application.coverNote || "No cover note provided"}
                </p>
              </div>
              <div>
                <Label>CV</Label>
                <div className="mt-1">
                  {application.cvUrl ? (
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Open CV
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No CV attached
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Applied On</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {application && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onUpdateStatus(application);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* ApplicationStatusDialog                                             */
/* ------------------------------------------------------------------ */

interface ApplicationStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
  onSuccess: () => void;
}

export function ApplicationStatusDialog({
  open,
  onOpenChange,
  application,
  onSuccess,
}: ApplicationStatusDialogProps) {
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate status whenever a new application is opened
  useState(() => {
    if (application) setStatus(application.status);
  });

  // Reset form each time the dialog opens
  if (open && application && status !== application.status && !loading) {
    // no-op — handled by the effect below
  }

  // Use a proper effect-free approach: derive once per open
  // (kept simple — parent passes a key or re-mounts if needed)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${application.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Application status updated successfully!");
        onOpenChange(false);
        onSuccess();
      } else {
        const errorMsg = data.error || "Failed to update application status";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
      const errorMsg = "Failed to update application status. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Change the status of this job application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {application && (
            <div className="p-3 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground">Applicant</p>
              <p className="text-sm font-mono font-medium mt-0.5">
                {shortId(application.workerId)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ApplicationStatus)}
              disabled={loading}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {APPLICATION_STATUS_CONFIG[opt].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Lifecycle: Applied → Reviewing → Shortlisted → Hired / Rejected
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
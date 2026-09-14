"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Video,
  Phone,
} from "lucide-react";
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

export type InterviewType = "in-person" | "phone" | "video";

export type InterviewStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Interview {
  id: string;
  applicationId: string;
  workerId: string;
  jobId: string;
  round: number;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  feedback: string | null;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
  // Associations
  worker?: {
    id: string;
    fullName: string;
    email: string;
  };
  job?: {
    id: string;
    jobRole: string;
  };
  application?: {
    id: string;
    status: string;
  };
}

export const INTERVIEW_TYPE_CONFIG: Record<
  InterviewType,
  { label: string; icon: typeof MapPin }
> = {
  "in-person": { label: "In-person", icon: MapPin },
  phone: { label: "Phone", icon: Phone },
  video: { label: "Video", icon: Video },
};

export const INTERVIEW_STATUS_CONFIG: Record<
  InterviewStatus,
  {
    label: string;
    variant: "success" | "secondary" | "warning" | "destructive";
    statClass: string;
  }
> = {
  scheduled: {
    label: "Scheduled",
    variant: "warning",
    statClass: "text-amber-600",
  },
  confirmed: {
    label: "Confirmed",
    variant: "secondary",
    statClass: "text-blue-600",
  },
  completed: {
    label: "Completed",
    variant: "success",
    statClass: "text-success",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    statClass: "text-destructive",
  },
  "no-show": {
    label: "No Show",
    variant: "destructive",
    statClass: "text-destructive",
  },
};

export const INTERVIEW_TYPE_OPTIONS: InterviewType[] = [
  "in-person",
  "phone",
  "video",
];

export const INTERVIEW_STATUS_OPTIONS: InterviewStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no-show",
];

export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/** Format a Date / ISO string as a local datetime input value (YYYY-MM-DDTHH:mm) */
function toDateTimeLocal(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/* ------------------------------------------------------------------ */
/* InterviewStatsCards                                                 */
/* ------------------------------------------------------------------ */

interface InterviewStatsCardsProps {
  interviews: Interview[];
}

export function InterviewStatsCards({ interviews }: InterviewStatsCardsProps) {
  const stats = {
    total: interviews.length,
    scheduled: interviews.filter((i) => i.status === "scheduled").length,
    confirmed: interviews.filter((i) => i.status === "confirmed").length,
    completed: interviews.filter((i) => i.status === "completed").length,
    cancelled: interviews.filter((i) => i.status === "cancelled").length,
    noShow: interviews.filter((i) => i.status === "no-show").length,
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
            className={`text-sm font-medium ${INTERVIEW_STATUS_CONFIG.scheduled.statClass}`}
          >
            Scheduled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scheduled}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${INTERVIEW_STATUS_CONFIG.confirmed.statClass}`}
          >
            Confirmed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.confirmed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${INTERVIEW_STATUS_CONFIG.completed.statClass}`}
          >
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${INTERVIEW_STATUS_CONFIG.cancelled.statClass}`}
          >
            Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.cancelled}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${INTERVIEW_STATUS_CONFIG["no-show"].statClass}`}
          >
            No Show
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.noShow}</div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InterviewFilters                                                    */
/* ------------------------------------------------------------------ */

interface InterviewFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
}

export function InterviewFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}: InterviewFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Interviews</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by worker name, job role, location, notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INTERVIEW_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {INTERVIEW_TYPE_CONFIG[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {INTERVIEW_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {INTERVIEW_STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* InterviewTable                                                      */
/* ------------------------------------------------------------------ */

interface InterviewTableProps {
  data: Interview[];
  onView: (interview: Interview) => void;
  onEdit: (interview: Interview) => void;
  onDelete: (id: string) => void;
}

export function InterviewTable({
  data,
  onView,
  onEdit,
  onDelete,
}: InterviewTableProps) {
  const columns = [
    {
      header: "Applicant",
      accessor: (row: Interview) => (
        <div>
          <p className="font-medium text-sm">
            {row.worker?.fullName || "Unknown Worker"}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.worker?.email || shortId(row.workerId)}
          </p>
        </div>
      ),
    },
    {
      header: "Job Role",
      accessor: (row: Interview) => (
        <div>
          <p className="font-medium text-sm">
            {row.job?.jobRole || "Unknown Job"}
          </p>
          <p className="text-xs text-muted-foreground">
            Round {row.round}
          </p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: Interview) => {
        const { label, icon: Icon } = INTERVIEW_TYPE_CONFIG[row.type];
        return (
          <div className="inline-flex items-center gap-1.5 text-sm">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            {label}
          </div>
        );
      },
    },
    {
      header: "Scheduled",
      accessor: (row: Interview) => (
        <div>
          <p className="text-sm">
            {new Date(row.scheduledAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.scheduledAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {row.durationMinutes}m
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: Interview) => {
        const meta = INTERVIEW_STATUS_CONFIG[row.status];
        return <StatusBadge status={meta.label} variant={meta.variant} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: Interview) => (
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
            onClick={() => onEdit(row)}
            title="Edit Interview"
          >
            <Edit className="h-4 w-4" />
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
      emptyMessage="No interviews scheduled"
    />
  );
}

/* ------------------------------------------------------------------ */
/* InterviewDetailsDialog                                              */
/* ------------------------------------------------------------------ */

interface InterviewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  onEdit: (interview: Interview) => void;
}

export function InterviewDetailsDialog({
  open,
  onOpenChange,
  interview,
  onEdit,
}: InterviewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
          <DialogDescription>
            Complete information about this interview
          </DialogDescription>
        </DialogHeader>

        {interview && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Applicant</Label>
                <p className="text-sm font-medium mt-1">
                  {interview.worker?.fullName || "Unknown Worker"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {interview.worker?.email || interview.workerId}
                </p>
              </div>
              <div>
                <Label>Job Role</Label>
                <p className="text-sm font-medium mt-1">
                  {interview.job?.jobRole || "Unknown Job"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {shortId(interview.jobId)}
                </p>
              </div>
              <div>
                <Label>Round</Label>
                <p className="text-sm font-medium mt-1">Round {interview.round}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm font-medium mt-1">
                  {INTERVIEW_TYPE_CONFIG[interview.type].label}
                </p>
              </div>
              <div>
                <Label>Scheduled At</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(interview.scheduledAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Duration</Label>
                <p className="text-sm font-medium mt-1">
                  {interview.durationMinutes} minutes
                </p>
              </div>
              {interview.location && (
                <div>
                  <Label>Location</Label>
                  <p className="text-sm font-medium mt-1">{interview.location}</p>
                </div>
              )}
              {interview.meetingLink && (
                <div>
                  <Label>Meeting Link</Label>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 block break-all"
                  >
                    {interview.meetingLink}
                  </a>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge
                    status={INTERVIEW_STATUS_CONFIG[interview.status].label}
                    variant={INTERVIEW_STATUS_CONFIG[interview.status].variant}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                  {interview.notes || "No notes"}
                </p>
              </div>
              <div>
                <Label>Feedback</Label>
                <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                  {interview.feedback || "No feedback yet"}
                </p>
              </div>
              <div>
                <Label>Application Status</Label>
                <p className="text-sm font-medium mt-1">
                  {interview.application?.status || "Unknown"}
                </p>
              </div>
              <div>
                <Label>Created At</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(interview.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {interview && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(interview);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Interview
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* InterviewForm                                                       */
/* ------------------------------------------------------------------ */

interface InterviewFormData {
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  meetingLink: string;
  notes: string;
  feedback: string;
  status: InterviewStatus;
  round: number;
}

interface InterviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Required for create — the application this interview belongs to */
  applicationId?: string;
  workerId?: string;
  jobId?: string;
  initialData?: Partial<{
    id: string;
    round: number;
    type: InterviewType;
    scheduledAt: string;
    durationMinutes: number;
    location: string | null;
    meetingLink: string | null;
    notes: string | null;
    feedback: string | null;
    status: InterviewStatus;
    worker?: { fullName: string; email: string; };
    job?: { jobRole: string; };
  }>;
  onSuccess: () => void;
}

const initialFormState: InterviewFormData = {
  type: "in-person",
  scheduledAt: "",
  durationMinutes: 30,
  location: "",
  meetingLink: "",
  notes: "",
  feedback: "",
  status: "scheduled",
  round: 1,
};

export function InterviewForm({
  open,
  onOpenChange,
  mode,
  applicationId,
  workerId,
  jobId,
  initialData,
  onSuccess,
}: InterviewFormProps) {
  const [formData, setFormData] = useState<InterviewFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Array<{
    id: string;
    workerId: string;
    jobId: string;
    worker: { id: string; fullName: string; email: string };
    job: { id: string; jobRole: string };
  }>>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");

  // Fetch applications for dropdown (only shortlisted ones)
  useEffect(() => {
    const fetchApplications = async () => {
      if (mode === "create" && !applicationId) {
        try {
          const response = await fetch("/api/applications?status=shortlisted&limit=100");
          const data = await response.json();
          if (data.success) {
            setApplications(data.data);
          }
        } catch (error) {
          console.error("Failed to fetch applications:", error);
        }
      }
    };

    if (open) {
      fetchApplications();
    }
  }, [open, mode, applicationId]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        type: initialData.type || "in-person",
        scheduledAt: toDateTimeLocal(initialData.scheduledAt),
        durationMinutes: initialData.durationMinutes ?? 30,
        location: initialData.location || "",
        meetingLink: initialData.meetingLink || "",
        notes: initialData.notes || "",
        feedback: initialData.feedback || "",
        status: initialData.status || "scheduled",
        round: initialData.round ?? 1,
      });
    } else if (mode === "create") {
      setFormData(initialFormState);
      setSelectedApplicationId(applicationId || "");
    }
    setError(null);
  }, [mode, initialData, open, applicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ── Client-side type-specific validation ───────────────────────
      if (formData.type === "in-person" && !formData.location.trim()) {
        setError("Location is required for in-person interviews.");
        setLoading(false);
        return;
      }
      if (
        (formData.type === "phone" || formData.type === "video") &&
        !formData.meetingLink.trim()
      ) {
        setError("Meeting link is required for phone and video interviews.");
        setLoading(false);
        return;
      }

      const iso = formData.scheduledAt
        ? new Date(formData.scheduledAt).toISOString()
        : "";

      // Get application details
      const selectedApp = applications.find(app => app.id === selectedApplicationId);
      const finalApplicationId = applicationId || selectedApplicationId;
      const finalWorkerId = workerId || selectedApp?.workerId;
      const finalJobId = jobId || selectedApp?.jobId;

      const payload =
        mode === "create"
          ? {
              applicationId: finalApplicationId,
              workerId: finalWorkerId,
              jobId: finalJobId,
              type: formData.type,
              scheduledAt: iso,
              durationMinutes: Number(formData.durationMinutes),
              location:
                formData.type === "in-person"
                  ? formData.location.trim()
                  : null,
              meetingLink:
                formData.type === "phone" || formData.type === "video"
                  ? formData.meetingLink.trim()
                  : null,
              notes: formData.notes || null,
              round: Number(formData.round),
            }
          : {
              type: formData.type,
              scheduledAt: iso,
              durationMinutes: Number(formData.durationMinutes),
              location: formData.location || null,
              meetingLink: formData.meetingLink || null,
              notes: formData.notes || null,
              feedback: formData.feedback || null,
              status: formData.status,
            };

      const url =
        mode === "create"
          ? "/api/interviews"
          : `/api/interviews/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||
            (mode === "create"
              ? "Interview scheduled successfully!"
              : "Interview updated successfully!")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        const errorMsg = data.error || `Failed to ${mode} interview`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(`Failed to ${mode} interview:`, err);
      const errorMsg = `Failed to ${mode} interview. Please try again.`;
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Schedule Interview" : "Edit Interview"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Schedule a new interview round for this application."
              : "Update interview details, status, or feedback."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Application/Applicant Info */}
            {mode === "create" && !applicationId ? (
              <div className="space-y-2">
                <Label htmlFor="application">
                  Select Application <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedApplicationId}
                  onValueChange={setSelectedApplicationId}
                  disabled={loading}
                >
                  <SelectTrigger id="application">
                    <SelectValue placeholder="Choose a shortlisted application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.worker.fullName} - {app.job.jobRole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select which applicant to schedule an interview for
                </p>
              </div>
            ) : mode === "create" && applicationId ? (
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground">Scheduling interview for</p>
                <p className="text-sm font-medium mt-0.5">Application ID: {shortId(applicationId)}</p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground">Applicant</p>
                <p className="text-sm font-medium mt-0.5">
                  {initialData?.worker?.fullName || "Unknown Worker"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {initialData?.worker?.email || ""}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Job Role</p>
                <p className="text-sm font-medium mt-0.5">
                  {initialData?.job?.jobRole || "Unknown Job"}
                </p>
              </div>
            )}

            {/* Round (create only) */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="round">Round</Label>
                <Input
                  id="round"
                  type="number"
                  min={1}
                  value={formData.round}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      round: parseInt(e.target.value) || 1,
                    })
                  }
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Defaults to the next round if left as-is
                </p>
              </div>
            )}

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Interview Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as InterviewType })
                }
                disabled={loading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {INTERVIEW_TYPE_CONFIG[opt].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled At */}
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">
                Scheduled At <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledAt: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">
                Duration (minutes) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="durationMinutes"
                type="number"
                min={5}
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: parseInt(e.target.value) || 30,
                  })
                }
                required
                disabled={loading}
              />
            </div>

            {/* Location — only for in-person */}
            {formData.type === "in-person" && (
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Office 3rd floor, Kathmandu"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Meeting Link — for phone/video */}
            {(formData.type === "phone" || formData.type === "video") && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">
                  Meeting Link <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Internal notes for the team"
                disabled={loading}
              />
            </div>

            {/* Feedback + Status (edit only) */}
            {mode === "edit" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Input
                    id="feedback"
                    value={formData.feedback}
                    onChange={(e) =>
                      setFormData({ ...formData, feedback: e.target.value })
                    }
                    placeholder="Post-interview feedback"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as InterviewStatus,
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {INTERVIEW_STATUS_CONFIG[opt].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Lifecycle: Scheduled → Confirmed → Completed / Cancelled /
                    No Show
                  </p>
                </div>
              </>
            )}
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
              {loading
                ? mode === "create"
                  ? "Scheduling..."
                  : "Updating..."
                : mode === "create"
                  ? "Schedule Interview"
                  : "Update Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
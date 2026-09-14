"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
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

export type JobStatus = "pending" | "processing" | "fulfilled" | "cancelled";
export type ExperienceRequired =
  | "Fresher"
  | "1-2 years"
  | "3-5 years"
  | "5+ years";
export type WorkType = "On-site" | "Remote" | "Hybrid";

export interface Job {
  id: string;
  jobRole: string;
  department: string;
  numberOfWorkers: number;
  requiredSkills: string[] | null;
  experienceRequired: ExperienceRequired;
  jobLocation: string;
  workType: WorkType;
  workingHours: string;
  responsibilities: string | null;
  status: JobStatus;
  createdAt: string;
}

export const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    variant: "success" | "secondary" | "warning" | "destructive";
    statClass: string;
  }
> = {
  pending: {
    label: "Pending",
    variant: "warning",
    statClass: "text-amber-600",
  },
  processing: {
    label: "Processing",
    variant: "secondary",
    statClass: "text-muted-foreground",
  },
  fulfilled: {
    label: "Fulfilled",
    variant: "success",
    statClass: "text-success",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    statClass: "text-destructive",
  },
};

export const EXPERIENCE_OPTIONS: ExperienceRequired[] = [
  "Fresher",
  "1-2 years",
  "3-5 years",
  "5+ years",
];

export const WORK_TYPE_OPTIONS: WorkType[] = ["On-site", "Remote", "Hybrid"];

export const STATUS_OPTIONS: JobStatus[] = [
  "pending",
  "processing",
  "fulfilled",
  "cancelled",
];

/* ------------------------------------------------------------------ */
/* JobStatsCards                                                       */
/* ------------------------------------------------------------------ */

interface JobStatsCardsProps {
  jobs: Job[];
}

export function JobStatsCards({ jobs }: JobStatsCardsProps) {
  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === "pending").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    fulfilled: jobs.filter((j) => j.status === "fulfilled").length,
    cancelled: jobs.filter((j) => j.status === "cancelled").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${STATUS_CONFIG.pending.statClass}`}
          >
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${STATUS_CONFIG.processing.statClass}`}
          >
            Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.processing}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${STATUS_CONFIG.fulfilled.statClass}`}
          >
            Fulfilled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fulfilled}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${STATUS_CONFIG.cancelled.statClass}`}
          >
            Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.cancelled}</div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* JobFilters                                                          */
/* ------------------------------------------------------------------ */

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function JobFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: JobFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Jobs</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, department, location, or skills..."
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
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* JobTable                                                            */
/* ------------------------------------------------------------------ */

interface JobTableProps {
  data: Job[];
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function JobTable({ data, onView, onEdit, onDelete }: JobTableProps) {
  const columns = [
    {
      header: "Job Role",
      accessor: (row: Job) => (
        <div>
          <p className="font-medium">{row.jobRole}</p>
          <p className="text-xs text-muted-foreground">{row.department}</p>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (row: Job) => (
        <div>
          <p className="text-sm">{row.jobLocation}</p>
          <p className="text-xs text-muted-foreground">{row.workType}</p>
        </div>
      ),
    },
    {
      header: "Experience",
      accessor: (row: Job) => (
        <p className="text-sm text-muted-foreground">
          {row.experienceRequired}
        </p>
      ),
    },
    {
      header: "Workers",
      accessor: (row: Job) => (
        <p className="text-sm font-medium">{row.numberOfWorkers}</p>
      ),
    },
    {
      header: "Status",
      accessor: (row: Job) => {
        const meta = STATUS_CONFIG[row.status];
        return <StatusBadge status={meta.label} variant={meta.variant} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: Job) => (
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
            title="Edit Job"
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
      emptyMessage="No jobs found"
    />
  );
}

/* ------------------------------------------------------------------ */
/* JobDetailsDialog                                                    */
/* ------------------------------------------------------------------ */

interface JobDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onEdit: (job: Job) => void;
}

export function JobDetailsDialog({
  open,
  onOpenChange,
  job,
  onEdit,
}: JobDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
          <DialogDescription>
            View complete information about this job
          </DialogDescription>
        </DialogHeader>

        {job && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Job Role</Label>
                <p className="text-sm font-medium mt-1">{job.jobRole}</p>
              </div>
              <div>
                <Label>Department</Label>
                <p className="text-sm font-medium mt-1">{job.department}</p>
              </div>
              <div>
                <Label>Number of Workers</Label>
                <p className="text-sm font-medium mt-1">{job.numberOfWorkers}</p>
              </div>
              <div>
                <Label>Required Skills</Label>
                <p className="text-sm font-medium mt-1">
                  {job.requiredSkills && job.requiredSkills.length > 0
                    ? job.requiredSkills.join(", ")
                    : "No specific skills"}
                </p>
              </div>
              <div>
                <Label>Experience Required</Label>
                <p className="text-sm font-medium mt-1">
                  {job.experienceRequired}
                </p>
              </div>
              <div>
                <Label>Job Location</Label>
                <p className="text-sm font-medium mt-1">{job.jobLocation}</p>
              </div>
              <div>
                <Label>Work Type</Label>
                <p className="text-sm font-medium mt-1">{job.workType}</p>
              </div>
              <div>
                <Label>Working Hours</Label>
                <p className="text-sm font-medium mt-1">{job.workingHours}</p>
              </div>
              <div>
                <Label>Responsibilities</Label>
                <p className="text-sm font-medium mt-1">
                  {job.responsibilities || "No description provided"}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge
                    status={STATUS_CONFIG[job.status].label}
                    variant={STATUS_CONFIG[job.status].variant}
                  />
                </div>
              </div>
              <div>
                <Label>Created At</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(job.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {job && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(job);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* JobForm                                                             */
/* ------------------------------------------------------------------ */

interface JobFormData {
  companyId: string;
  jobRole: string;
  department: string;
  numberOfWorkers: number;
  requiredSkills: string;
  experienceRequired: ExperienceRequired;
  jobLocation: string;
  workType: WorkType;
  workingHours: string;
  responsibilities: string;
  status: JobStatus;
}

interface JobFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Partial<{
    id: string;
    companyId: string | null;
    jobRole: string;
    department: string;
    numberOfWorkers: number;
    requiredSkills: string[] | null;
    experienceRequired: ExperienceRequired;
    jobLocation: string;
    workType: WorkType;
    workingHours: string;
    responsibilities: string | null;
    status: JobStatus;
  }>;
  onSuccess: () => void;
}

const initialFormState: JobFormData = {
  companyId: "",
  jobRole: "",
  department: "",
  numberOfWorkers: 1,
  requiredSkills: "",
  experienceRequired: "Fresher",
  jobLocation: "",
  workType: "On-site",
  workingHours: "",
  responsibilities: "",
  status: "pending",
};

export function JobForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSuccess,
}: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; companyName: string }>>([]);

  useEffect(() => {
    // Fetch companies for dropdown
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        const data = await response.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };
    
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        companyId: initialData.companyId || "",
        jobRole: initialData.jobRole || "",
        department: initialData.department || "",
        numberOfWorkers: initialData.numberOfWorkers ?? 1,
        requiredSkills:
          initialData.requiredSkills && initialData.requiredSkills.length > 0
            ? initialData.requiredSkills.join(", ")
            : "",
        experienceRequired: initialData.experienceRequired || "Fresher",
        jobLocation: initialData.jobLocation || "",
        workType: initialData.workType || "On-site",
        workingHours: initialData.workingHours || "",
        responsibilities: initialData.responsibilities || "",
        status: initialData.status || "pending",
      });
    } else if (mode === "create") {
      setFormData(initialFormState);
    }
    setError(null);
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/jobs" : `/api/jobs/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const skillsArray = formData.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        companyId: formData.companyId || null,
        jobRole: formData.jobRole,
        department: formData.department,
        numberOfWorkers: Number(formData.numberOfWorkers),
        requiredSkills: skillsArray.length > 0 ? skillsArray : null,
        experienceRequired: formData.experienceRequired,
        jobLocation: formData.jobLocation,
        workType: formData.workType,
        workingHours: formData.workingHours,
        responsibilities: formData.responsibilities || null,
        status: formData.status,
      };

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
              ? "Job created successfully!"
              : "Job updated successfully!")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        const errorMessage = typeof data.error === 'string' ? data.error : data.error?.message || `Failed to ${mode} job`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error(`Failed to ${mode} job:`, err);
      const errorMsg = err instanceof Error ? err.message : `Failed to ${mode} job. Please try again.`;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Job" : "Edit Job"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new job posting to the platform."
              : "Update job information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Company Selection */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="companyId">
                Company <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyId: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="companyId">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the company this job is for
              </p>
            </div>

            {/* Job Role */}
            <div className="space-y-2">
              <Label htmlFor="jobRole">
                Job Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jobRole"
                value={formData.jobRole}
                onChange={(e) =>
                  setFormData({ ...formData, jobRole: e.target.value })
                }
                placeholder="e.g., Security Guard"
                required
                disabled={loading}
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="e.g., Security"
                required
                disabled={loading}
              />
            </div>

            {/* Number of Workers */}
            <div className="space-y-2">
              <Label htmlFor="numberOfWorkers">
                Number of Workers <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numberOfWorkers"
                type="number"
                min={1}
                value={formData.numberOfWorkers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfWorkers: parseInt(e.target.value) || 1,
                  })
                }
                placeholder="1"
                required
                disabled={loading}
              />
            </div>

            {/* Experience Required */}
            <div className="space-y-2">
              <Label htmlFor="experienceRequired">
                Experience Required <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.experienceRequired}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    experienceRequired: value as ExperienceRequired,
                  })
                }
                disabled={loading}
              >
                <SelectTrigger id="experienceRequired">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Location */}
            <div className="space-y-2">
              <Label htmlFor="jobLocation">
                Job Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jobLocation"
                value={formData.jobLocation}
                onChange={(e) =>
                  setFormData({ ...formData, jobLocation: e.target.value })
                }
                placeholder="e.g., Kathmandu"
                required
                disabled={loading}
              />
            </div>

            {/* Work Type */}
            <div className="space-y-2">
              <Label htmlFor="workType">
                Work Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.workType}
                onValueChange={(value) =>
                  setFormData({ ...formData, workType: value as WorkType })
                }
                disabled={loading}
              >
                <SelectTrigger id="workType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Working Hours */}
            <div className="space-y-2">
              <Label htmlFor="workingHours">
                Working Hours <span className="text-destructive">*</span>
              </Label>
              <Input
                id="workingHours"
                value={formData.workingHours}
                onChange={(e) =>
                  setFormData({ ...formData, workingHours: e.target.value })
                }
                placeholder="e.g., 9:00 AM - 6:00 PM"
                required
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as JobStatus })
                }
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {STATUS_CONFIG[opt].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Track the lifecycle of this job posting
              </p>
            </div>

            {/* Required Skills - Full Width */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <Input
                id="requiredSkills"
                value={formData.requiredSkills}
                onChange={(e) =>
                  setFormData({ ...formData, requiredSkills: e.target.value })
                }
                placeholder="e.g., Physical fitness, CCTV monitoring"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple skills with commas
              </p>
            </div>

            {/* Responsibilities - Full Width */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Input
                id="responsibilities"
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsibilities: e.target.value,
                  })
                }
                placeholder="Brief description of the job responsibilities"
                disabled={loading}
              />
            </div>
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
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Job"
                  : "Update Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
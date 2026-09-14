"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
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

export type SalaryPeriod = "monthly" | "weekly" | "daily";

export type OnboardingStatus =
  | "pending"
  | "offer_sent"
  | "documents_submitted"
  | "active"
  | "terminated";

export interface OnboardingJoinedWorker {
  id: string;
  fullName: string;
  email: string;
}

export interface OnboardingJoinedJob {
  id: string;
  jobRole: string;
  department: string;
}

export interface OnboardingJoinedCompany {
  id: string;
  companyName: string;
  companyCode: string;
  industry: string;
}

export interface Onboarding {
  id: string;
  applicationId: string;
  workerId: string;
  jobId: string;
  companyId: string;
  joiningDate: string;
  salaryAmount: number;
  salaryPeriod: SalaryPeriod;
  status: OnboardingStatus;
  offerLetterUrl: string | null;
  contractUrl: string | null;
  citizenshipUrl: string | null;
  passportUrl: string | null;
  ppPhotoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // joined
  worker?: OnboardingJoinedWorker;
  job?: OnboardingJoinedJob;
  company?: OnboardingJoinedCompany;
}

export const ONBOARDING_STATUS_CONFIG: Record<
  OnboardingStatus,
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
  offer_sent: {
    label: "Offer Sent",
    variant: "secondary",
    statClass: "text-blue-600",
  },
  documents_submitted: {
    label: "Documents Submitted",
    variant: "secondary",
    statClass: "text-indigo-600",
  },
  active: {
    label: "Active",
    variant: "success",
    statClass: "text-success",
  },
  terminated: {
    label: "Terminated",
    variant: "destructive",
    statClass: "text-destructive",
  },
};

export const SALARY_PERIOD_CONFIG: Record<
  SalaryPeriod,
  { label: string; suffix: string }
> = {
  monthly: { label: "Monthly", suffix: "/mo" },
  weekly: { label: "Weekly", suffix: "/wk" },
  daily: { label: "Daily", suffix: "/day" },
};

export const ONBOARDING_STATUS_OPTIONS: OnboardingStatus[] = [
  "pending",
  "offer_sent",
  "documents_submitted",
  "active",
  "terminated",
];

export const SALARY_PERIOD_OPTIONS: SalaryPeriod[] = [
  "monthly",
  "weekly",
  "daily",
];

export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function formatSalary(amount: number, period: SalaryPeriod): string {
  return `Rs. ${amount.toLocaleString()}${SALARY_PERIOD_CONFIG[period].suffix}`;
}

/* ------------------------------------------------------------------ */
/* OnboardingStatsCards                                                */
/* ------------------------------------------------------------------ */

interface OnboardingStatsCardsProps {
  onboardings: Onboarding[];
}

export function OnboardingStatsCards({
  onboardings,
}: OnboardingStatsCardsProps) {
  const stats = {
    total: onboardings.length,
    pending: onboardings.filter((o) => o.status === "pending").length,
    offer_sent: onboardings.filter((o) => o.status === "offer_sent").length,
    documents_submitted: onboardings.filter(
      (o) => o.status === "documents_submitted",
    ).length,
    active: onboardings.filter((o) => o.status === "active").length,
    terminated: onboardings.filter((o) => o.status === "terminated").length,
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
            className={`text-sm font-medium ${ONBOARDING_STATUS_CONFIG.pending.statClass}`}
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
            className={`text-sm font-medium ${ONBOARDING_STATUS_CONFIG.offer_sent.statClass}`}
          >
            Offer Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.offer_sent}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ONBOARDING_STATUS_CONFIG.documents_submitted.statClass}`}
          >
            Docs Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.documents_submitted}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ONBOARDING_STATUS_CONFIG.active.statClass}`}
          >
            Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={`text-sm font-medium ${ONBOARDING_STATUS_CONFIG.terminated.statClass}`}
          >
            Terminated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.terminated}</div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OnboardingFilters                                                   */
/* ------------------------------------------------------------------ */

interface OnboardingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function OnboardingFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: OnboardingFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Onboardings</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by worker name, job role, company..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ONBOARDING_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {ONBOARDING_STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* OnboardingTable                                                     */
/* ------------------------------------------------------------------ */

interface OnboardingTableProps {
  data: Onboarding[];
  onView: (onboarding: Onboarding) => void;
  onEdit: (onboarding: Onboarding) => void;
  onDelete: (id: string) => void;
}

export function OnboardingTable({
  data,
  onView,
  onEdit,
  onDelete,
}: OnboardingTableProps) {
  const columns = [
    {
      header: "Worker",
      accessor: (row: Onboarding) => (
        <div>
          <p className="font-medium">
            {row.worker?.fullName || shortId(row.workerId)}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.worker?.email || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Job",
      accessor: (row: Onboarding) => (
        <div>
          <p className="text-sm">{row.job?.jobRole || shortId(row.jobId)}</p>
          <p className="text-xs text-muted-foreground">
            {row.job?.department || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Company",
      accessor: (row: Onboarding) => (
        <div>
          <p className="text-sm">
            {row.company?.companyName || shortId(row.companyId)}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.company?.industry || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Salary",
      accessor: (row: Onboarding) => (
        <p className="text-sm font-medium">
          {formatSalary(row.salaryAmount, row.salaryPeriod)}
        </p>
      ),
    },
    {
      header: "Joining Date",
      accessor: (row: Onboarding) => (
        <p className="text-sm text-muted-foreground">
          {new Date(row.joiningDate).toLocaleDateString()}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: (row: Onboarding) => {
        const meta = ONBOARDING_STATUS_CONFIG[row.status];
        return <StatusBadge status={meta.label} variant={meta.variant} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: Onboarding) => (
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
            title="Edit Onboarding"
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
      emptyMessage="No onboarding records found"
    />
  );
}

/* ------------------------------------------------------------------ */
/* DocumentLink — small helper for the details dialog                  */
/* ------------------------------------------------------------------ */

function DocumentLink({
  label,
  url,
}: {
  label: string;
  url: string | null;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            View
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">Not uploaded</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OnboardingDetailsDialog                                             */
/* ------------------------------------------------------------------ */

interface OnboardingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onboarding: Onboarding | null;
  onEdit: (onboarding: Onboarding) => void;
}

export function OnboardingDetailsDialog({
  open,
  onOpenChange,
  onboarding,
  onEdit,
}: OnboardingDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding Details</DialogTitle>
          <DialogDescription>
            Complete onboarding record for this placement
          </DialogDescription>
        </DialogHeader>

        {onboarding && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Worker</Label>
                <p className="text-sm font-medium mt-1">
                  {onboarding.worker?.fullName || shortId(onboarding.workerId)}
                </p>
                {onboarding.worker?.email && (
                  <p className="text-xs text-muted-foreground">
                    {onboarding.worker.email}
                  </p>
                )}
              </div>
              <div>
                <Label>Company</Label>
                <p className="text-sm font-medium mt-1">
                  {onboarding.company?.companyName ||
                    shortId(onboarding.companyId)}
                </p>
                {onboarding.company?.industry && (
                  <p className="text-xs text-muted-foreground">
                    {onboarding.company.industry}
                  </p>
                )}
              </div>
              <div>
                <Label>Job Role</Label>
                <p className="text-sm font-medium mt-1">
                  {onboarding.job?.jobRole || shortId(onboarding.jobId)}
                </p>
                {onboarding.job?.department && (
                  <p className="text-xs text-muted-foreground">
                    {onboarding.job.department}
                  </p>
                )}
              </div>
              <div>
                <Label>Joining Date</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(onboarding.joiningDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>Salary</Label>
                <p className="text-sm font-medium mt-1">
                  {formatSalary(onboarding.salaryAmount, onboarding.salaryPeriod)}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <StatusBadge
                    status={ONBOARDING_STATUS_CONFIG[onboarding.status].label}
                    variant={
                      ONBOARDING_STATUS_CONFIG[onboarding.status].variant
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-3">Documents</p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocumentLink
                  label="Offer Letter"
                  url={onboarding.offerLetterUrl}
                />
                <DocumentLink label="Contract" url={onboarding.contractUrl} />
                <DocumentLink
                  label="Citizenship"
                  url={onboarding.citizenshipUrl}
                />
                <DocumentLink label="Passport" url={onboarding.passportUrl} />
                <DocumentLink
                  label="PP Photo"
                  url={onboarding.ppPhotoUrl}
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <Label>Notes</Label>
              <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                {onboarding.notes || "No notes provided"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
              <div>
                <Label>Created At</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(onboarding.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(onboarding.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onboarding && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(onboarding);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Onboarding
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* OnboardingForm                                                      */
/* ------------------------------------------------------------------ */

interface OnboardingFormData {
  // create-only
  applicationId: string;
  workerId: string;
  jobId: string;
  companyId: string;
  // shared
  joiningDate: string;
  salaryAmount: number;
  salaryPeriod: SalaryPeriod;
  // edit-only
  status: OnboardingStatus;
  offerLetterUrl: string;
  contractUrl: string;
  citizenshipUrl: string;
  passportUrl: string;
  ppPhotoUrl: string;
  // shared
  notes: string;
}

interface OnboardingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Prefill for create — usually passed from an application page */
  prefill?: {
    applicationId?: string;
    workerId?: string;
    jobId?: string;
    companyId?: string;
  };
  initialData?: Partial<{
    id: string;
    joiningDate: string;
    salaryAmount: number;
    salaryPeriod: SalaryPeriod;
    status: OnboardingStatus;
    offerLetterUrl: string | null;
    contractUrl: string | null;
    citizenshipUrl: string | null;
    passportUrl: string | null;
    ppPhotoUrl: string | null;
    notes: string | null;
  }>;
  onSuccess: () => void;
}

const initialFormState: OnboardingFormData = {
  applicationId: "",
  workerId: "",
  jobId: "",
  companyId: "",
  joiningDate: "",
  salaryAmount: 0,
  salaryPeriod: "monthly",
  status: "pending",
  offerLetterUrl: "",
  contractUrl: "",
  citizenshipUrl: "",
  passportUrl: "",
  ppPhotoUrl: "",
  notes: "",
};

export function OnboardingForm({
  open,
  onOpenChange,
  mode,
  prefill,
  initialData,
  onSuccess,
}: OnboardingFormProps) {
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dropdown data
  const [workers, setWorkers] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
  const [jobs, setJobs] = useState<Array<{ id: string; jobRole: string; department: string }>>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; companyName: string; industry: string }>>([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (mode === "create" && open) {
        try {
          // Fetch workers
          const workersRes = await fetch("/api/workers?limit=100");
          const workersData = await workersRes.json();
          if (workersData.success) setWorkers(workersData.data);

          // Fetch jobs
          const jobsRes = await fetch("/api/jobs?limit=100");
          const jobsData = await jobsRes.json();
          if (jobsData.success) setJobs(jobsData.data);

          // Fetch companies
          const companiesRes = await fetch("/api/companies?limit=100");
          const companiesData = await companiesRes.json();
          if (companiesData.success) setCompanies(companiesData.data);
        } catch (error) {
          console.error("Failed to fetch dropdown data:", error);
        }
      }
    };

    fetchDropdownData();
  }, [mode, open]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        ...initialFormState,
        joiningDate: initialData.joiningDate || "",
        salaryAmount: initialData.salaryAmount ?? 0,
        salaryPeriod: initialData.salaryPeriod || "monthly",
        status: initialData.status || "pending",
        offerLetterUrl: initialData.offerLetterUrl || "",
        contractUrl: initialData.contractUrl || "",
        citizenshipUrl: initialData.citizenshipUrl || "",
        passportUrl: initialData.passportUrl || "",
        ppPhotoUrl: initialData.ppPhotoUrl || "",
        notes: initialData.notes || "",
      });
    } else if (mode === "create") {
      setFormData({
        ...initialFormState,
        applicationId: prefill?.applicationId || "",
        workerId: prefill?.workerId || "",
        jobId: prefill?.jobId || "",
        companyId: prefill?.companyId || "",
      });
    }
    setError(null);
  }, [mode, initialData, prefill, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/onboarding"
          : `/api/onboarding/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const payload =
        mode === "create"
          ? {
              applicationId: formData.applicationId.trim(),
              workerId: formData.workerId.trim(),
              jobId: formData.jobId.trim(),
              companyId: formData.companyId.trim(),
              joiningDate: formData.joiningDate,
              salaryAmount: Number(formData.salaryAmount),
              salaryPeriod: formData.salaryPeriod,
              notes: formData.notes || null,
            }
          : {
              status: formData.status,
              joiningDate: formData.joiningDate,
              salaryAmount: Number(formData.salaryAmount),
              salaryPeriod: formData.salaryPeriod,
              offerLetterUrl: formData.offerLetterUrl || null,
              contractUrl: formData.contractUrl || null,
              citizenshipUrl: formData.citizenshipUrl || null,
              passportUrl: formData.passportUrl || null,
              ppPhotoUrl: formData.ppPhotoUrl || null,
              notes: formData.notes || null,
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
              ? "Onboarding created successfully!"
              : "Onboarding updated successfully!")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        const errorMsg = data.error || `Failed to ${mode} onboarding`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(`Failed to ${mode} onboarding:`, err);
      const errorMsg = `Failed to ${mode} onboarding. Please try again.`;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Onboarding" : "Edit Onboarding"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create an onboarding record for an accepted application."
              : "Update onboarding status, documents, and details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {/* ── Create-only: Dropdowns ─────────────────────────────────── */}
          {mode === "create" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workerId">
                  Worker <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.workerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, workerId: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="workerId">
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.fullName} - {worker.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobId">
                  Job <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.jobId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jobId: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="jobId">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.jobRole} - {job.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
                        {company.companyName} - {company.industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationId">
                  Application ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="applicationId"
                  value={formData.applicationId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationId: e.target.value,
                    })
                  }
                  placeholder="UUID of the hired application"
                  required
                  disabled={loading}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the application ID from the applications page
                </p>
              </div>
            </div>
          )}

          {/* ── Shared: joining date + salary ────────────────────── */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joiningDate">
                Joining Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData({ ...formData, joiningDate: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryAmount">
                  Salary Amount (NPR){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salaryAmount"
                  type="number"
                  min={0}
                  value={formData.salaryAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g., 25000"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">
                  Salary Period <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.salaryPeriod}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      salaryPeriod: value as SalaryPeriod,
                    })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="salaryPeriod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {SALARY_PERIOD_CONFIG[opt].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Edit-only: status + documents ────────────────────── */}
          {mode === "edit" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as OnboardingStatus,
                    })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ONBOARDING_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {ONBOARDING_STATUS_CONFIG[opt].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Lifecycle: Pending → Offer Sent → Documents Submitted →
                  Active / Terminated
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-3">
                  Document URLs (upload separately, paste the URL here)
                </p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="offerLetterUrl">Offer Letter URL</Label>
                    <Input
                      id="offerLetterUrl"
                      value={formData.offerLetterUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          offerLetterUrl: e.target.value,
                        })
                      }
                      placeholder="/uploads/onboarding/offer-letter-xyz.pdf"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractUrl">Contract URL</Label>
                    <Input
                      id="contractUrl"
                      value={formData.contractUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractUrl: e.target.value,
                        })
                      }
                      placeholder="/uploads/onboarding/contract-xyz.pdf"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="citizenshipUrl">Citizenship URL</Label>
                    <Input
                      id="citizenshipUrl"
                      value={formData.citizenshipUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          citizenshipUrl: e.target.value,
                        })
                      }
                      placeholder="/uploads/onboarding/citizenship-xyz.pdf"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportUrl">Passport URL</Label>
                    <Input
                      id="passportUrl"
                      value={formData.passportUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passportUrl: e.target.value,
                        })
                      }
                      placeholder="/uploads/onboarding/passport-xyz.pdf"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ppPhotoUrl">PP Photo URL</Label>
                    <Input
                      id="ppPhotoUrl"
                      value={formData.ppPhotoUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ppPhotoUrl: e.target.value,
                        })
                      }
                      placeholder="/uploads/onboarding/pp-photo-xyz.jpg"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Shared: notes ────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Report to Kathmandu office on first day."
              disabled={loading}
            />
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
                  ? "Create Onboarding"
                  : "Update Onboarding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
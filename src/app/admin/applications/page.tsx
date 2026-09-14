"use client";

import { useEffect, useState } from "react";
import { Eye, Trash2, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/Pagination";
import {
  ApplicationStatsCards,
  ApplicationFilters,
  ApplicationDetailsDialog,
  ApplicationStatusDialog,
  type JobApplication,
  APPLICATION_STATUS_CONFIG,
} from "../../../components/admin/ApplicationComponent";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

/** Shorten a UUID for compact display */
function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

interface Job {
  id: string;
  jobRole: string;
}

interface Worker {
  id: string;
  fullName: string;
  email: string;
}

interface ApplicationWithDetails extends JobApplication {
  job?: Job;
  worker?: Worker;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusDialogKey, setStatusDialogKey] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.workerId.toLowerCase().includes(q) ||
          app.jobId.toLowerCase().includes(q) ||
          app.worker?.fullName.toLowerCase().includes(q) ||
          app.worker?.email.toLowerCase().includes(q) ||
          app.job?.jobRole.toLowerCase().includes(q) ||
          (app.coverNote && app.coverNote.toLowerCase().includes(q))
      );
    }

    setFilteredApplications(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Application deleted successfully!");
        fetchApplications();
      } else {
        toast.error("Failed to delete application");
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleOpenStatusDialog = (app: JobApplication) => {
    setSelectedApplication(app);
    setStatusDialogKey((k) => k + 1);
    setShowStatusDialog(true);
  };

  const columns = [
    {
      header: "Worker",
      accessor: (row: ApplicationWithDetails) => (
        <div>
          <p className="font-medium text-sm">
            {row.worker?.fullName || shortId(row.workerId)}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.worker?.email || "No email"}
          </p>
        </div>
      ),
    },
    {
      header: "Job Role",
      accessor: (row: ApplicationWithDetails) => (
        <div>
          <p className="font-medium text-sm">
            {row.job?.jobRole || "Unknown Job"}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {shortId(row.jobId)}
          </p>
        </div>
      ),
    },
    {
      header: "CV",
      accessor: (row: ApplicationWithDetails) =>
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
      header: "Applied On",
      accessor: (row: ApplicationWithDetails) => (
        <p className="text-sm text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: (row: ApplicationWithDetails) => {
        const meta = APPLICATION_STATUS_CONFIG[row.status];
        return <StatusBadge status={meta.label} variant={meta.variant} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: ApplicationWithDetails) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedApplication(row);
              setShowDetailsDialog(true);
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenStatusDialog(row)}
            title="Update Status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Job Applications"
        description="Manage all job applications submitted by workers"
      />

      <ApplicationStatsCards applications={applications} />

      <ApplicationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
      />

      <DataTable
        data={filteredApplications}
        columns={columns}
        emptyMessage="No applications found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <ApplicationDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        application={selectedApplication}
        onUpdateStatus={handleOpenStatusDialog}
      />

      <ApplicationStatusDialog
        key={statusDialogKey}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        application={selectedApplication}
        onSuccess={fetchApplications}
      />
    </div>
  );
}
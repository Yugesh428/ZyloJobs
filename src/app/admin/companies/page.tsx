"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  companyName: string;
  companyCode: string;
  companyType: string;
  industry: string;
  email: string;
  status: "pending" | "active" | "suspended";
  registrationNumber: string | null;
  panNumber: string | null;
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchQuery]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    // Search filter (client-side for current page)
    if (searchQuery) {
      filtered = filtered.filter(
        (company) =>
          company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.companyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleStatusChange = async (companyId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Company status updated successfully!");
        fetchCompanies();
      } else {
        toast.error("Failed to update company status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update company status");
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Company deleted successfully!");
        fetchCompanies();
      } else {
        toast.error("Failed to delete company");
      }
    } catch (error) {
      console.error("Failed to delete company:", error);
      toast.error("Failed to delete company");
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedCompany(null);
    setShowFormDialog(true);
  };

  const handleEditClick = (company: Company) => {
    setFormMode("edit");
    setSelectedCompany(company);
    setShowFormDialog(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const columns = [
    {
      header: "Company Name",
      accessor: (row: Company) => (
        <div>
          <p className="font-medium">{row.companyName}</p>
          <p className="text-xs text-muted-foreground">{row.companyCode}</p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "companyType" as keyof Company,
    },
    {
      header: "Industry",
      accessor: "industry" as keyof Company,
    },
    {
      header: "Email",
      accessor: "email" as keyof Company,
    },
    {
      header: "Status",
      accessor: (row: Company) => (
        <StatusBadge status={row.status} variant={getStatusVariant(row.status)} />
      ),
    },
    {
      header: "Actions",
      accessor: (row: Company) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedCompany(row);
              setShowDetailsDialog(true);
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(row)}
            title="Edit Company"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          {row.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusChange(row.id, "active")}
                title="Approve"
              >
                <CheckCircle className="h-4 w-4 text-success" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusChange(row.id, "suspended")}
                title="Suspend"
              >
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
          
          {row.status === "active" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.id, "suspended")}
              title="Suspend"
            >
              <XCircle className="h-4 w-4 text-destructive" />
            </Button>
          )}
          
          {row.status === "suspended" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.id, "active")}
              title="Activate"
            >
              <CheckCircle className="h-4 w-4 text-success" />
            </Button>
          )}
          
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

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
    pending: companies.filter((c) => c.status === "pending").length,
    suspended: companies.filter((c) => c.status === "suspended").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Companies Management"
        description="Manage all registered companies on the platform"
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-success">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-warning">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Companies</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, email, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <DataTable
        data={filteredCompanies}
        columns={columns}
        emptyMessage="No companies found"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {/* Company Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>
              View complete information about this company
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <p className="text-sm font-medium mt-1">{selectedCompany.companyName}</p>
                </div>
                <div>
                  <Label>Company Code</Label>
                  <p className="text-sm font-medium mt-1">{selectedCompany.companyCode}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm font-medium mt-1">{selectedCompany.companyType}</p>
                </div>
                <div>
                  <Label>Industry</Label>
                  <p className="text-sm font-medium mt-1">{selectedCompany.industry}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium mt-1">{selectedCompany.email}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedCompany.status}
                      variant={getStatusVariant(selectedCompany.status)}
                    />
                  </div>
                </div>
                {selectedCompany.registrationNumber && (
                  <div>
                    <Label>Registration Number</Label>
                    <p className="text-sm font-medium mt-1">{selectedCompany.registrationNumber}</p>
                  </div>
                )}
                {selectedCompany.panNumber && (
                  <div>
                    <Label>PAN Number</Label>
                    <p className="text-sm font-medium mt-1">{selectedCompany.panNumber}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Created At</Label>
                  <p className="text-sm font-medium mt-1">
                    {new Date(selectedCompany.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedCompany && (
              <Button onClick={() => {
                setShowDetailsDialog(false);
                handleEditClick(selectedCompany);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Company
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Form (Create/Edit) */}
      <CompanyForm
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={formMode}
        initialData={selectedCompany || undefined}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}

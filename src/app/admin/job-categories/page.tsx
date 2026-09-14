"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { JobCategoryForm } from "@/components/admin/JobCategoryForm";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function JobCategoriesPage() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCategories();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (statusFilter === "active") {
        params.append("isActive", "true");
      } else if (statusFilter === "inactive") {
        params.append("isActive", "false");
      }
      
      const response = await fetch(`/api/job-categories?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch job categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Search filter (client-side for current page)
    if (searchQuery) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredCategories(filtered);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this job category?")) return;

    try {
      const response = await fetch(`/api/job-categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Job category deleted successfully!");
        fetchCategories();
      } else {
        toast.error("Failed to delete job category");
      }
    } catch (error) {
      console.error("Failed to delete job category:", error);
      toast.error("Failed to delete job category");
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setShowFormDialog(true);
  };

  const handleEditClick = (category: JobCategory) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setShowFormDialog(true);
  };

  const columns = [
    {
      header: "Category Name",
      accessor: (row: JobCategory) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.code}</p>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (row: JobCategory) => (
        <p className="text-sm text-muted-foreground">
          {row.description || "No description"}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: (row: JobCategory) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          variant={row.isActive ? "success" : "secondary"}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (row: JobCategory) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedCategory(row);
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
            title="Edit Category"
          >
            <Edit className="h-4 w-4" />
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

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading job categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Job Categories"
        description="Manage job categories to organize job postings"
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or description..."
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
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <DataTable
        data={filteredCategories}
        columns={columns}
        emptyMessage="No job categories found"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {/* Category Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Job Category Details</DialogTitle>
            <DialogDescription>
              View complete information about this category
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Category Name</Label>
                  <p className="text-sm font-medium mt-1">{selectedCategory.name}</p>
                </div>
                <div>
                  <Label>Category Code</Label>
                  <p className="text-sm font-medium mt-1">{selectedCategory.code}</p>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedCategory.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedCategory.isActive ? "active" : "inactive"}
                      variant={selectedCategory.isActive ? "success" : "secondary"}
                    />
                  </div>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm font-medium mt-1">
                    {new Date(selectedCategory.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedCategory && (
              <Button onClick={() => {
                setShowDetailsDialog(false);
                handleEditClick(selectedCategory);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Form (Create/Edit) */}
      <JobCategoryForm
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={formMode}
        initialData={selectedCategory ? {
          ...selectedCategory,
          description: selectedCategory.description || undefined
        } : undefined}
        onSuccess={fetchCategories}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import {
  AttendanceStatsCards,
  AttendanceFilters,
  AttendanceTable,
  AttendanceDetailsDialog,
  AttendanceForm,
  type Attendance,
} from "@/components/admin/AttendanceComponents";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 31;

  useEffect(() => {
    fetchAttendances();
  }, [currentPage, statusFilter, fromDate, toDate]);

  useEffect(() => {
    filterAttendances();
  }, [attendances, searchQuery]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const response = await fetch(`/api/attendance?${params}`);
      const data = await response.json();

      if (data.success) {
        setAttendances(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch attendances:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const filterAttendances = () => {
    let filtered = [...attendances];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.worker?.fullName || "").toLowerCase().includes(q) ||
          (a.worker?.email || "").toLowerCase().includes(q) ||
          (a.company?.companyName || "").toLowerCase().includes(q) ||
          (a.adminNote || "").toLowerCase().includes(q),
      );
    }

    setFilteredAttendances(filtered);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this attendance record? This cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Attendance record deleted successfully!");
        fetchAttendances();
      } else {
        toast.error(data.error || "Failed to delete attendance record");
      }
    } catch (error) {
      console.error("Failed to delete attendance:", error);
      toast.error("Failed to delete attendance record. Please try again.");
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedAttendance(null);
    setFormKey((k) => k + 1);
    setShowFormDialog(true);
  };

  const handleEditClick = (attendance: Attendance) => {
    setFormMode("edit");
    setSelectedAttendance(attendance);
    setFormKey((k) => k + 1);
    setShowFormDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Attendance Management"
        description="Track and manage worker attendance records"
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attendance
          </Button>
        }
      />

      <AttendanceStatsCards attendances={attendances} />

      <AttendanceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
        fromDate={fromDate}
        onFromDateChange={(value) => {
          setFromDate(value);
          setCurrentPage(1);
        }}
        toDate={toDate}
        onToDateChange={(value) => {
          setToDate(value);
          setCurrentPage(1);
        }}
      />

      <AttendanceTable
        data={filteredAttendances}
        onView={(a) => {
          setSelectedAttendance(a);
          setShowDetailsDialog(true);
        }}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <AttendanceDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        attendance={selectedAttendance}
        onEdit={handleEditClick}
      />

      <AttendanceForm
        key={formKey}
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={formMode}
        initialData={selectedAttendance || undefined}
        onSuccess={fetchAttendances}
      />
    </div>
  );
}

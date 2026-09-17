"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/company/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { DataTable } from "@/components/company/DataTable";

interface AttendanceRecord {
  id: string;
  workerName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workHours: number | null;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      
      if (!res.ok) {
        console.error("Failed to fetch attendance:", res.status);
        setLoading(false);
        return;
      }
      
      const text = await res.text();
      if (!text) {
        console.error("Empty response from API");
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(text);
      if (data.success && Array.isArray(data.data)) {
        setAttendance(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "half-day":
        return "bg-yellow-100 text-yellow-800";
      case "leave":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { 
      header: "Worker Name",
      accessor: "workerName" as keyof AttendanceRecord
    },
    { 
      header: "Date",
      accessor: (record: AttendanceRecord) => new Date(record.date).toLocaleDateString()
    },
    { 
      header: "Check In",
      accessor: (record: AttendanceRecord) => record.checkInTime || "-"
    },
    { 
      header: "Check Out",
      accessor: (record: AttendanceRecord) => record.checkOutTime || "-"
    },
    { 
      header: "Hours",
      accessor: (record: AttendanceRecord) => record.workHours ? `${record.workHours}h` : "-"
    },
    {
      header: "Status",
      accessor: (record: AttendanceRecord) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
          {record.status}
        </span>
      ),
    },
  ];

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const leaveCount = attendance.filter((a) => a.status === "leave").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Attendance"
        description="Track worker attendance and work hours"
      />

      {/* Date Filter & Stats */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{leaveCount}</p>
            <p className="text-xs text-muted-foreground">On Leave</p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No attendance records for this date</p>
            </div>
          ) : (
            <DataTable columns={columns} data={attendance} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

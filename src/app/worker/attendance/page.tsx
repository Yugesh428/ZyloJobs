"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/worker/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle, Calendar, Search } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: "present" | "absent" | "late" | "half-day";
  notes: string | null;
  worker?: {
    fullName: string;
  };
}

export default function WorkerAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    totalDays: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual worker ID from auth
      // For now, get the first worker from the database
      let workerId = "temp-worker-id";
      
      const workersRes = await fetch("/api/workers?limit=1");
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        if (workersData.success && workersData.data.length > 0) {
          workerId = workersData.data[0].id;
        }
      }
      
      const res = await fetch(`/api/attendance?workerId=${workerId}&date=${selectedDate}`);
      
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to fetch attendance:", text);
        throw new Error("Failed to fetch attendance");
      }

      const data = await res.json();
      if (data.success) {
        setAttendance(data.data);
        
        // Calculate stats
        const present = data.data.filter((a: AttendanceRecord) => a.status === "present").length;
        const absent = data.data.filter((a: AttendanceRecord) => a.status === "absent").length;
        const late = data.data.filter((a: AttendanceRecord) => a.status === "late").length;
        
        setStats({
          present,
          absent,
          late,
          totalDays: data.data.length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      "half-day": "bg-blue-100 text-blue-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

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
        title="My Attendance"
        description="View your attendance history and records"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold">{stats.late}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Button onClick={fetchAttendance}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Check In</th>
                  <th className="text-left p-3 font-medium">Check Out</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-accent">
                      <td className="p-3">
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </td>
                      <td className="p-3">
                        {record.checkInTime
                          ? format(new Date(record.checkInTime), "hh:mm a")
                          : "-"}
                      </td>
                      <td className="p-3">
                        {record.checkOutTime
                          ? format(new Date(record.checkOutTime), "hh:mm a")
                          : "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

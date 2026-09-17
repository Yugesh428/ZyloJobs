"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/worker/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MessageSquare, HelpCircle, Briefcase, CheckCircle } from "lucide-react";

interface DashboardStats {
  attendanceToday: string;
  totalComplaints: number;
  openTickets: number;
  currentJob: string;
}

export default function WorkerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    attendanceToday: "Not marked",
    totalComplaints: 0,
    openTickets: 0,
    currentJob: "Loading...",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
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

      // Fetch worker's attendance today
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await fetch(`/api/attendance?date=${today}&workerId=${workerId}`);
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        if (attendanceData.success && attendanceData.data.length > 0) {
          const status = attendanceData.data[0].status;
          setStats(prev => ({ ...prev, attendanceToday: status }));
        }
      }

      // Fetch worker complaints
      const complaintsRes = await fetch(`/api/worker-complaints?workerId=${workerId}`);
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        if (complaintsData.success) {
          setStats(prev => ({ ...prev, totalComplaints: complaintsData.data.length }));
        }
      }

      // Fetch support tickets
      const ticketsRes = await fetch(`/api/worker-support?workerId=${workerId}`);
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        if (ticketsData.success) {
          const open = ticketsData.data.filter((t: any) => t.status === "open" || t.status === "in-progress").length;
          setStats(prev => ({ ...prev, openTickets: open }));
        }
      }

      // Fetch worker profile/job info
      const workerRes = await fetch(`/api/workers/${workerId}`);
      if (workerRes.ok) {
        const workerData = await workerRes.json();
        if (workerData.success && workerData.data) {
          setStats(prev => ({ ...prev, currentJob: workerData.data.currentJob || "No job assigned" }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
        title="Worker Dashboard"
        description="Welcome back! Here's your overview"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Attendance</p>
                <p className="text-2xl font-bold capitalize">{stats.attendanceToday}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Complaints</p>
                <p className="text-2xl font-bold">{stats.totalComplaints}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Job</p>
                <p className="text-sm font-semibold truncate">{stats.currentJob}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/worker/attendance"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">View Attendance</p>
                  <p className="text-xs text-muted-foreground">Check your attendance history</p>
                </div>
              </a>
              <a
                href="/worker/complaints"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">File Complaint</p>
                  <p className="text-xs text-muted-foreground">Report an issue</p>
                </div>
              </a>
              <a
                href="/worker/support"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Get Support</p>
                  <p className="text-xs text-muted-foreground">Create a support ticket</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Attendance Marked</p>
                  <p className="text-xs text-muted-foreground">Today at 9:00 AM</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center py-4">
                No more recent activity
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

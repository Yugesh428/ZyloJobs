"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/company/PageHeader";
import { StatCard } from "@/components/company/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, MessageSquare, ClipboardList, CheckCircle, XCircle } from "lucide-react";

interface DashboardStats {
  activeWorkers: number;
  pendingRequests: number;
  totalComplaints: number;
  attendanceToday: number;
}

interface RecentRequest {
  id: string;
  jobRole: string;
  numberOfWorkers: number;
  status: string;
  createdAt: string;
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeWorkers: 0,
    pendingRequests: 0,
    totalComplaints: 0,
    attendanceToday: 0,
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch worker requests
      const requestsRes = await fetch("/api/worker-requests?limit=5");
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        if (requestsData.success && Array.isArray(requestsData.data)) {
          setRecentRequests(requestsData.data);
          const pending = requestsData.data.filter((r: RecentRequest) => r.status === "pending").length;
          setStats(prev => ({ ...prev, pendingRequests: pending }));
        }
      }

      // Fetch active workers (from onboarding)
      const workersRes = await fetch("/api/onboarding?status=active");
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        if (workersData.success && Array.isArray(workersData.data)) {
          setStats(prev => ({ ...prev, activeWorkers: workersData.data.length }));
        }
      }

      // Fetch complaints
      const complaintsRes = await fetch("/api/company-complaints");
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        if (complaintsData.success && Array.isArray(complaintsData.data)) {
          const open = complaintsData.data.filter((c: any) => c.status === "open" || c.status === "pending").length;
          setStats(prev => ({ ...prev, totalComplaints: open }));
        }
      }

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await fetch(`/api/attendance?date=${today}`);
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        if (attendanceData.success && Array.isArray(attendanceData.data)) {
          const present = attendanceData.data.filter((a: any) => a.status === "present").length;
          setStats(prev => ({ ...prev, attendanceToday: present }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "fulfilled":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        title="Company Dashboard"
        description="Overview of your workforce and operations"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Workers"
          value={stats.activeWorkers}
          icon={Users}
          description="Currently employed"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={ClipboardList}
          description="Awaiting approval"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.attendanceToday}/${stats.activeWorkers}`}
          icon={Clock}
          description="Workers present today"
        />
        <StatCard
          title="Open Complaints"
          value={stats.totalComplaints}
          icon={MessageSquare}
          description="Requires attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Worker Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent requests
              </p>
            ) : (
              <div className="space-y-4">
                {recentRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{request.jobRole}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.numberOfWorkers} workers needed
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Active Workers</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeWorkers} workers currently active
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Attendance Rate</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeWorkers > 0
                      ? Math.round((stats.attendanceToday / stats.activeWorkers) * 100)
                      : 0}
                    % present today
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Open Issues</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalComplaints} complaints need attention
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalWorkers: number;
  availableWorkers: number;
  totalJobs: number;
  activeJobs: number;
  pendingApplications: number;
  todayInterviews: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalWorkers: 0,
    availableWorkers: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingApplications: 0,
    todayInterviews: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Simulated data for now
      setStats({
        totalCompanies: 45,
        activeCompanies: 38,
        totalWorkers: 320,
        availableWorkers: 156,
        totalJobs: 28,
        activeJobs: 18,
        pendingApplications: 67,
        todayInterviews: 8,
      });

      setRecentActivity([
        {
          id: "1",
          type: "New Application",
          description: "John Doe applied for Software Developer",
          timestamp: "5 minutes ago",
        },
        {
          id: "2",
          type: "Company Registered",
          description: "TechCorp Solutions joined the platform",
          timestamp: "1 hour ago",
        },
        {
          id: "3",
          type: "Interview Scheduled",
          description: "Interview scheduled for Jane Smith",
          timestamp: "2 hours ago",
        },
        {
          id: "4",
          type: "Worker Onboarded",
          description: "Mike Johnson onboarded at DataTech",
          timestamp: "3 hours ago",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome to ZYLO Job Admin Panel. Monitor and manage your staffing platform."
        action={
          <Button onClick={fetchDashboardData}>
            <Clock className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies}
          change={`${stats.activeCompanies} active`}
          changeType="increase"
          icon={Building2}
          iconBgColor="bg-primary-soft"
          iconColor="text-primary"
        />
        <StatCard
          title="Total Workers"
          value={stats.totalWorkers}
          change={`${stats.availableWorkers} available`}
          changeType="increase"
          icon={Users}
          iconBgColor="bg-success-soft"
          iconColor="text-success"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          change={`${stats.totalJobs} total jobs`}
          changeType="neutral"
          icon={Briefcase}
          iconBgColor="bg-accent-soft"
          iconColor="text-accent"
        />
        <StatCard
          title="Applications"
          value={stats.pendingApplications}
          change={`${stats.todayInterviews} interviews today`}
          changeType="increase"
          icon={FileText}
          iconBgColor="bg-info-soft"
          iconColor="text-info"
        />
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
                >
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start">
              <Building2 className="mr-2 h-4 w-4" />
              Create New Company
            </Button>
            <Button variant="outline" className="justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Review Applications
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>System status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Success Rate</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "94%" }} />
                </div>
                <span className="text-sm font-bold">94%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Response Time</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "87%" }} />
                </div>
                <span className="text-sm font-bold">1.2s</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Uptime</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "99.9%" }} />
                </div>
                <span className="text-sm font-bold">99.9%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

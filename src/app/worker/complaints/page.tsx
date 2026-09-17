"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/worker/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Plus, X } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  workerId: string;
  companyId: string;
  subject: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "investigating" | "resolved" | "closed";
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  company?: {
    companyName: string;
  };
}

export default function WorkerComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "workplace",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    companyId: "",
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
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

      const res = await fetch(`/api/worker-complaints?workerId=${workerId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

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
      
      // Get the first company for now (until we have proper auth)
      if (!formData.companyId) {
        const companiesRes = await fetch("/api/companies?limit=1");
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          if (companiesData.success && companiesData.data.length > 0) {
            formData.companyId = companiesData.data[0].id;
          }
        }
      }

      const res = await fetch("/api/worker-complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          companyId: formData.companyId,
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit complaint");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Complaint submitted successfully");
        setShowForm(false);
        setFormData({
          subject: "",
          description: "",
          category: "workplace",
          priority: "medium",
          companyId: "",
        });
        fetchComplaints();
      }
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      toast.error("Failed to submit complaint");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      investigating: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
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
      <div className="flex items-center justify-between">
        <PageHeader
          title="My Complaints"
          description="View and manage your complaints"
        />
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              File Complaint
            </>
          )}
        </Button>
      </div>

      {/* Complaint Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workplace">Workplace</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Complaint</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No complaints filed yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(complaint.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityBadge(
                        complaint.priority
                      )}`}
                    >
                      {complaint.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm capitalize">{complaint.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{complaint.description}</p>
                  </div>
                  {complaint.resolution && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-muted-foreground">Resolution</p>
                      <p className="text-sm text-green-700">{complaint.resolution}</p>
                      {complaint.resolvedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Resolved on {format(new Date(complaint.resolvedAt), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

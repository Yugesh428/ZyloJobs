"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/company/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Complaint {
  id: string;
  complaintText: string;
  status: string;
  priority: string;
  category: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  Worker?: {
    fullName: string;
  };
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/company-complaints");
      
      if (!res.ok) {
        console.error("Failed to fetch complaints:", res.status);
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
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolution.trim()) {
      toast.error("Please provide a resolution");
      return;
    }

    try {
      const res = await fetch(`/api/company-complaints/${selectedComplaint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          resolution: resolution.trim(),
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update complaint");
        return;
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Complaint resolved successfully");
        setDialogOpen(false);
        setResolution("");
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (error) {
      console.error("Failed to resolve complaint:", error);
      toast.error("An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const openComplaints = complaints.filter(c => c.status === "open" || c.status === "pending").length;
  const resolvedComplaints = complaints.filter(c => c.status === "resolved" || c.status === "closed").length;

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
        title="Complaints"
        description="Manage and resolve worker complaints"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">{complaints.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Complaints</p>
                <p className="text-2xl font-bold text-yellow-600">{openComplaints}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedComplaints}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No complaints found</p>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{complaint.category}</h3>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority} priority
                        </Badge>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      
                      {complaint.Worker && (
                        <p className="text-sm text-muted-foreground">
                          From: {complaint.Worker.fullName}
                        </p>
                      )}
                      
                      <p className="text-sm">{complaint.complaintText}</p>
                      
                      {complaint.resolution && (
                        <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                          <p className="text-xs font-medium text-green-900 mb-1">Resolution:</p>
                          <p className="text-sm text-green-800">{complaint.resolution}</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {(complaint.status === "open" || complaint.status === "pending") && (
                    <Dialog open={dialogOpen && selectedComplaint?.id === complaint.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) {
                        setSelectedComplaint(complaint);
                      } else {
                        setSelectedComplaint(null);
                        setResolution("");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">Resolve</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Complaint</DialogTitle>
                          <DialogDescription>
                            Provide a resolution for this complaint
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Complaint:</p>
                            <p className="text-sm text-muted-foreground">{complaint.complaintText}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Resolution</label>
                            <Textarea
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              placeholder="Enter resolution details..."
                              rows={4}
                              className="mt-2"
                            />
                          </div>
                          <Button onClick={handleResolve} className="w-full">
                            Submit Resolution
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

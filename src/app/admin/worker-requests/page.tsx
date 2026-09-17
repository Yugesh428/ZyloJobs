"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Clock, Building2, Users, Briefcase } from "lucide-react";

interface WorkerRequest {
  id: string;
  jobRole: string;
  department: string;
  numberOfWorkers: number;
  jobLocation: string;
  experienceRequired: string;
  workType: string;
  workingHours: string;
  requiredSkills: string[] | null;
  responsibilities: string | null;
  status: string;
  createdAt: string;
  company?: {
    companyName: string;
    companyCode: string;
    email: string;
  };
}

export default function AdminWorkerRequestsPage() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WorkerRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/worker-requests");
      
      if (!res.ok) {
        console.error("Failed to fetch requests:", res.status);
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
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: "fulfilled" | "cancelled") => {
    try {
      const res = await fetch(`/api/worker-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update request status");
        return;
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`Request ${newStatus === "fulfilled" ? "approved" : "cancelled"} successfully`);
        setDialogOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "fulfilled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.company?.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const fulfilledCount = requests.filter(r => r.status === "fulfilled").length;
  const cancelledCount = requests.filter(r => r.status === "cancelled").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Worker Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage and approve company worker requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fulfilled</p>
                <p className="text-2xl font-bold text-green-600">{fulfilledCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job role, department, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "fulfilled" ? "default" : "outline"}
            onClick={() => setStatusFilter("fulfilled")}
            size="sm"
          >
            Fulfilled
          </Button>
          <Button
            variant={statusFilter === "cancelled" ? "default" : "outline"}
            onClick={() => setStatusFilter("cancelled")}
            size="sm"
          >
            Cancelled
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No requests found matching your search" : "No worker requests yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{request.jobRole}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {request.company && (
                            <>
                              <Building2 className="h-4 w-4" />
                              <span>{request.company.companyName}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{request.department}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Workers Needed</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {request.numberOfWorkers}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Location</p>
                        <p className="font-medium">📍 {request.jobLocation}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Experience</p>
                        <p className="font-medium">{request.experienceRequired}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Work Type</p>
                        <p className="font-medium">{request.workType}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Working Hours</p>
                      <p className="font-medium">⏰ {request.workingHours}</p>
                    </div>

                    {request.requiredSkills && request.requiredSkills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.requiredSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {request.responsibilities && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Responsibilities:</p>
                        <p className="text-sm">{request.responsibilities}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Created: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {request.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(request.id, "cancelled")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Worker Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Job Role:</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.jobRole}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Company:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.company?.companyName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Workers Needed:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.numberOfWorkers}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleStatusUpdate(selectedRequest.id, "fulfilled")}
                  className="flex-1"
                >
                  Confirm Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

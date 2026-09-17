"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/company/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
}

export default function WorkerRequestsPage() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    jobRole: "",
    department: "",
    numberOfWorkers: "",
    jobLocation: "",
    experienceRequired: "Fresher",
    workType: "On-site",
    workingHours: "",
    requiredSkills: "",
    responsibilities: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, get the first company (temporary solution until auth is implemented)
      const companiesRes = await fetch("/api/companies?limit=1");
      
      if (!companiesRes.ok) {
        const errorText = await companiesRes.text();
        console.error("Failed to fetch companies:", companiesRes.status, errorText);
        toast.error("Failed to fetch company information");
        return;
      }
      
      const companiesText = await companiesRes.text();
      if (!companiesText) {
        toast.error("Empty response from companies API");
        return;
      }
      
      const companiesData = JSON.parse(companiesText);
      
      if (!companiesData.success || !companiesData.data || companiesData.data.length === 0) {
        toast.error("No company found. Please create a company from the admin panel first.");
        return;
      }
      
      const companyId = companiesData.data[0].id;
      console.log("Using company ID:", companyId);
      
      const requestBody = {
        jobRole: formData.jobRole,
        department: formData.department,
        numberOfWorkers: parseInt(formData.numberOfWorkers),
        jobLocation: formData.jobLocation,
        experienceRequired: formData.experienceRequired,
        workType: formData.workType,
        workingHours: formData.workingHours,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()) : null,
        responsibilities: formData.responsibilities || null,
        companyId: companyId,
      };
      
      console.log("Submitting worker request:", requestBody);
      
      const res = await fetch("/api/worker-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Worker request failed:", res.status, errorText);
        toast.error(`Request failed: ${res.status}`);
        return;
      }

      const text = await res.text();
      if (!text) {
        toast.error("Empty response from server");
        return;
      }

      const data = JSON.parse(text);

      if (data.success) {
        toast.success("Worker request created successfully!");
        setDialogOpen(false);
        setFormData({
          jobRole: "",
          department: "",
          numberOfWorkers: "",
          jobLocation: "",
          experienceRequired: "Fresher",
          workType: "On-site",
          workingHours: "",
          requiredSkills: "",
          responsibilities: "",
        });
        fetchRequests();
      } else {
        toast.error(data.error?.message || "Failed to create request");
      }
    } catch (error) {
      console.error("Request creation error:", error);
      toast.error("An error occurred while creating the request");
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
        title="Worker Requests"
        description="Create and manage your worker requirements"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Worker Request</DialogTitle>
                <DialogDescription>
                  Submit a new request for workers
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobRole">Job Role *</Label>
                    <Input
                      id="jobRole"
                      value={formData.jobRole}
                      onChange={(e) =>
                        setFormData({ ...formData, jobRole: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfWorkers">Number of Workers *</Label>
                    <Input
                      id="numberOfWorkers"
                      type="number"
                      min="1"
                      value={formData.numberOfWorkers}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfWorkers: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobLocation">Location *</Label>
                    <Input
                      id="jobLocation"
                      value={formData.jobLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, jobLocation: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceRequired">Experience Required *</Label>
                    <select
                      id="experienceRequired"
                      value={formData.experienceRequired}
                      onChange={(e) =>
                        setFormData({ ...formData, experienceRequired: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workType">Work Type *</Label>
                    <select
                      id="workType"
                      value={formData.workType}
                      onChange={(e) =>
                        setFormData({ ...formData, workType: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours *</Label>
                    <Input
                      id="workingHours"
                      placeholder="e.g., 9 AM - 5 PM"
                      value={formData.workingHours}
                      onChange={(e) =>
                        setFormData({ ...formData, workingHours: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
                    <Input
                      id="requiredSkills"
                      placeholder="e.g., Communication, Teamwork"
                      value={formData.requiredSkills}
                      onChange={(e) =>
                        setFormData({ ...formData, requiredSkills: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Row 5 - Full width */}
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      setFormData({ ...formData, responsibilities: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Requests List */}
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No worker requests found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first request to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{request.jobRole}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.department} • {request.numberOfWorkers} workers needed
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span>📍 {request.jobLocation}</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {request.workType}
                      </span>
                      <span className="text-muted-foreground">
                        {request.experienceRequired}
                      </span>
                      <span className="text-muted-foreground">
                        ⏰ {request.workingHours}
                      </span>
                    </div>
                    {request.requiredSkills && request.requiredSkills.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Skills:</span>
                        {request.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {request.responsibilities && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {request.responsibilities}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

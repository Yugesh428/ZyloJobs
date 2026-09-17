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
import { HelpCircle, Plus, X } from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  workerId: string;
  subject: string;
  message: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  adminReply: string | null;
  assignedTo: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function WorkerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "account" as "account" | "job" | "onboarding" | "attendance" | "payment" | "technical" | "other",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
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

      const res = await fetch(`/api/worker-support?workerId=${workerId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch support tickets");
      }

      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
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

      const res = await fetch("/api/worker-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create support ticket");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Support ticket created successfully");
        setShowForm(false);
        setFormData({
          subject: "",
          message: "",
          category: "account",
          priority: "medium",
        });
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      toast.error("Failed to create support ticket");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.open;
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
          title="Support"
          description="Get help and support from our team"
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
              Create Ticket
            </>
          )}
        </Button>
      </div>

      {/* Ticket Form */}
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
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="job">Job</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
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
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
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
                <Button type="submit">Create Ticket</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No support tickets yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityBadge(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm capitalize">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your Message</p>
                    <p className="text-sm">{ticket.message}</p>
                  </div>
                  {ticket.adminReply && (
                    <div className="border-t pt-3 bg-blue-50 -mx-6 px-6 py-3">
                      <p className="text-sm font-medium text-blue-900">Admin Reply</p>
                      <p className="text-sm text-blue-800">{ticket.adminReply}</p>
                    </div>
                  )}
                  {ticket.assignedTo && (
                    <div className="text-xs text-muted-foreground">
                      Assigned to: {ticket.assignedTo}
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

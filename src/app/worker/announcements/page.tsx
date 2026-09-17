"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/worker/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: "all" | "workers" | "companies" | "admins";
  priority: "low" | "medium" | "high" | "urgent";
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function WorkerAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/announcements?targetAudience=workers,all&isActive=true");

      if (!res.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
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

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: "📢",
      medium: "📣",
      high: "⚠️",
      urgent: "🚨",
    };
    return icons[priority as keyof typeof icons] || icons.medium;
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
        title="Announcements"
        description="View important updates and announcements"
      />

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active announcements</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" role="img" aria-label="priority">
                      {getPriorityIcon(announcement.priority)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(announcement.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityBadge(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <span className="capitalize">
                      Target: {announcement.targetAudience}
                    </span>
                    {announcement.expiresAt && (
                      <span>
                        Expires: {format(new Date(announcement.expiresAt), "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

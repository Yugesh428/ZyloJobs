"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/company/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, Target } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  targetAudience: string;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      
      if (!res.ok) {
        console.error("Failed to fetch announcements:", res.status);
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
        // Filter for company-relevant announcements
        const companyAnnouncements = data.data.filter(
          (a: Announcement) => 
            a.isActive && 
            (a.targetAudience === "company" || a.targetAudience === "all")
        );
        setAnnouncements(companyAnnouncements);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
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
        title="Announcements"
        description="Important updates and notices"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {announcements.filter(a => a.priority === "high").length}
                </p>
              </div>
              <Badge className="bg-red-100 text-red-800">🔴</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {announcements.filter(a => {
                    if (!a.expiryDate) return false;
                    const daysUntilExpiry = Math.floor(
                      (new Date(a.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active announcements</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for updates
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => {
            const isExpiringSoon = announcement.expiryDate && 
              Math.floor((new Date(announcement.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7;
            
            return (
              <Card 
                key={announcement.id} 
                className={`hover:shadow-md transition-shadow border-l-4 ${
                  announcement.priority === "high" 
                    ? "border-l-red-500" 
                    : announcement.priority === "medium" 
                    ? "border-l-yellow-500" 
                    : "border-l-green-500"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getPriorityIcon(announcement.priority)}</span>
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority} priority
                        </Badge>
                        {isExpiringSoon && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Target: {announcement.targetAudience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                      {announcement.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expires: {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

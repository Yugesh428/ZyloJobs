"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/worker/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit } from "lucide-react";

interface WorkerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  passportNo: string;
  skills: string;
  experience: number;
  qualifications: string;
  currentJob?: string;
  joiningDate?: string;
}

export default function WorkerProfile() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkerProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // TODO: Replace with actual worker ID from auth
      // For now, get the first worker from the database
      const workersRes = await fetch("/api/workers?limit=1");
      if (!workersRes.ok) {
        throw new Error("Failed to fetch workers");
      }
      
      const workersData = await workersRes.json();
      if (!workersData.success || workersData.data.length === 0) {
        throw new Error("No workers found");
      }
      
      const workerId = workersData.data[0].id;
      const res = await fetch(`/api/workers/${workerId}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!profile) return;

      const res = await fetch(`/api/workers/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <PageHeader title="My Profile" description="Manage your profile information" />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <PageHeader title="My Profile" description="View and manage your profile information" />
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              {editing ? (
                <Input
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium mt-1">{profile.fullName}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm font-medium mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {profile.email}
              </p>
            </div>
            <div>
              <Label>Phone</Label>
              {editing ? (
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {profile.phone}
                </p>
              )}
            </div>
            <div>
              <Label>Date of Birth</Label>
              <p className="text-sm font-medium mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(profile.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>Gender</Label>
              <p className="text-sm font-medium mt-1 capitalize">{profile.gender}</p>
            </div>
            <div>
              <Label>Nationality</Label>
              <p className="text-sm font-medium mt-1">{profile.nationality}</p>
            </div>
            <div>
              <Label>Passport Number</Label>
              <p className="text-sm font-medium mt-1">{profile.passportNo}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Address</Label>
              {editing ? (
                <Input
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium mt-1">{profile.address}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Skills</Label>
              <p className="text-sm font-medium mt-1">{profile.skills}</p>
            </div>
            <div>
              <Label>Experience</Label>
              <p className="text-sm font-medium mt-1">{profile.experience} years</p>
            </div>
            <div>
              <Label>Qualifications</Label>
              <p className="text-sm font-medium mt-1">{profile.qualifications}</p>
            </div>
            {profile.currentJob && (
              <div>
                <Label>Current Job</Label>
                <p className="text-sm font-medium mt-1">{profile.currentJob}</p>
              </div>
            )}
            {profile.joiningDate && (
              <div>
                <Label>Joining Date</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(profile.joiningDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => {
            setEditing(false);
            setFormData(profile);
          }}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

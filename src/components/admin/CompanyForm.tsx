"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompanyFormData {
  companyName: string;
  companyCode: string;
  email: string;
  password: string;
  companyType: string;
  industry: string;
  status: string;
  registrationNumber: string;
  panNumber: string;
  companyDescription: string;
}

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Partial<CompanyFormData> & { id?: string };
  onSuccess: () => void;
}

const initialFormState: CompanyFormData = {
  companyName: "",
  companyCode: "",
  email: "",
  password: "",
  companyType: "Private",
  industry: "",
  status: "active",
  registrationNumber: "",
  panNumber: "",
  companyDescription: "",
};

export function CompanyForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSuccess,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        companyName: initialData.companyName || "",
        companyCode: initialData.companyCode || "",
        email: initialData.email || "",
        password: "", // Password should remain empty for edit mode
        companyType: initialData.companyType || "Private",
        industry: initialData.industry || "",
        status: initialData.status || "active",
        registrationNumber: initialData.registrationNumber || "",
        panNumber: initialData.panNumber || "",
        companyDescription: initialData.companyDescription || "",
      });
    } else if (mode === "create") {
      setFormData(initialFormState);
    }
    setError(null);
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/companies"
          : `/api/companies/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      // For edit mode, only include password if it's been changed
      const payload =
        mode === "edit" && !formData.password
          ? { ...formData, password: undefined }
          : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||
            (mode === "create"
              ? "Company created successfully!"
              : "Company updated successfully!")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        setError(data.error || `Failed to ${mode} company`);
        toast.error(data.error || `Failed to ${mode} company`);
      }
    } catch (err) {
      console.error(`Failed to ${mode} company:`, err);
      const errorMsg = `Failed to ${mode} company. Please try again.`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Company" : "Edit Company"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new company to the platform. Credentials will be sent to their email."
              : "Update company information. Leave password empty to keep the current password."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Enter company name"
                required
                disabled={loading}
              />
            </div>

            {/* Company Code */}
            <div className="space-y-2">
              <Label htmlFor="companyCode">
                Company Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyCode"
                value={formData.companyCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., TECH001"
                required
                disabled={loading || mode === "edit"} // Code shouldn't be changed after creation
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="company@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {mode === "create" && <span className="text-destructive">*</span>}
                {mode === "edit" && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (leave empty to keep current)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={mode === "edit" ? "Enter new password (optional)" : "Min. 8 characters"}
                required={mode === "create"}
                minLength={formData.password ? 8 : undefined}
                disabled={loading}
              />
            </div>

            {/* Company Type */}
            <div className="space-y-2">
              <Label htmlFor="companyType">
                Company Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.companyType}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyType: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="companyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">
                Industry <span className="text-destructive">*</span>
              </Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="e.g., Technology, Healthcare"
                required
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
                placeholder="Company registration number"
                disabled={loading}
              />
            </div>

            {/* PAN Number */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={formData.panNumber}
                onChange={(e) =>
                  setFormData({ ...formData, panNumber: e.target.value })
                }
                placeholder="Permanent Account Number"
                disabled={loading}
              />
            </div>

            {/* Company Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Input
                id="companyDescription"
                value={formData.companyDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyDescription: e.target.value,
                  })
                }
                placeholder="Brief description of the company"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Company"
                : "Update Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

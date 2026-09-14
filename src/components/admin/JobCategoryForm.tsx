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

interface JobCategoryFormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface JobCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Partial<JobCategoryFormData> & { id?: string };
  onSuccess: () => void;
}

const initialFormState: JobCategoryFormData = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

export function JobCategoryForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSuccess,
}: JobCategoryFormProps) {
  const [formData, setFormData] = useState<JobCategoryFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
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
          ? "/api/job-categories"
          : `/api/job-categories/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||
            (mode === "create"
              ? "Job category created successfully!"
              : "Job category updated successfully!")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        setError(data.error || `Failed to ${mode} job category`);
        toast.error(data.error || `Failed to ${mode} job category`);
      }
    } catch (err) {
      console.error(`Failed to ${mode} job category:`, err);
      const errorMsg = `Failed to ${mode} job category. Please try again.`;
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Job Category" : "Edit Job Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new job category to organize job postings."
              : "Update job category information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Information Technology"
                required
                disabled={loading}
              />
            </div>

            {/* Category Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Category Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., IT"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for internal use
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this category"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="isActive">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "true" })
                }
                disabled={loading}
              >
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Inactive categories won't be available for new job postings
              </p>
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
                ? "Create Category"
                : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

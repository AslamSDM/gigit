"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, FileText, Upload, Loader2, Award } from "lucide-react";

interface License {
  id: string;
  name: string;
  issuingAuthority: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  state: string;
  documentUrl: string;
}

interface LicensesStepProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const emptyLicense: Omit<License, "id"> = {
  name: "",
  issuingAuthority: "",
  licenseNumber: "",
  issueDate: "",
  expiryDate: "",
  state: "",
  documentUrl: "",
};

export function LicensesStep({
  data,
  onUpdate,
  onBack,
  onSkip,
  onComplete,
  isSubmitting,
}: LicensesStepProps) {
  const [licenses, setLicenses] = useState<License[]>(data.licenses || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<License, "id">>(emptyLicense);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "licenses",
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, publicUrl } = await response.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      handleChange("documentUrl", publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.issuingAuthority) return;

    const newLicense: License = {
      ...formData,
      id: Date.now().toString(),
    };

    setLicenses([...licenses, newLicense]);
    setFormData(emptyLicense);
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    setLicenses(
      licenses.map((lic) =>
        lic.id === editingId ? { ...formData, id: editingId } : lic
      )
    );
    setFormData(emptyLicense);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setLicenses(licenses.filter((lic) => lic.id !== id));
  };

  const handleCancel = () => {
    setFormData(emptyLicense);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ licenses });
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add your professional licenses and certifications. These help verify your
        qualifications and can increase your chances of getting hired.
      </p>

      {/* Licenses List */}
      {licenses.length > 0 && !isAdding && (
        <div className="space-y-3">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{license.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {license.issuingAuthority}
                        {license.state && ` · ${license.state}`}
                      </p>
                      {license.licenseNumber && (
                        <p className="text-sm text-muted-foreground">
                          License #: {license.licenseNumber}
                        </p>
                      )}
                      {license.expiryDate && (
                        <p className="text-sm text-muted-foreground">
                          Expires: {license.expiryDate}
                        </p>
                      )}
                      {license.documentUrl && (
                        <a
                          href={license.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center mt-1"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View Document
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(license);
                        setEditingId(license.id);
                        setIsAdding(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(license.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {editingId ? "Edit License" : "Add License/Certification"}
            </h4>
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">License/Certification Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Master Plumber License"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
              <Input
                id="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={(e) => handleChange("issuingAuthority", e.target.value)}
                placeholder="e.g., State Board of Plumbing"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
              placeholder="e.g., PL-123456"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleChange("issueDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Upload Document (Optional)</Label>
            {formData.documentUrl ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm">Document uploaded</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange("documentUrl", "")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Click to upload (PDF or image)
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <Button
            type="button"
            onClick={editingId ? handleUpdate : handleAdd}
            className="w-full"
          >
            {editingId ? "Update License" : "Add License"}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add License or Certification
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onUpdate({ licenses });
              onComplete();
            }}
            disabled={isSubmitting}
          >
            Skip & Finish
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        </div>
      </div>
    </form>
  );
}

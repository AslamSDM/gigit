"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, Building2 } from "lucide-react";

interface BusinessInfoStepProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

const COMPANY_SIZES = [
  { value: "SMALL", label: "Small (1-50 employees)" },
  { value: "MEDIUM", label: "Medium (51-200 employees)" },
  { value: "LARGE", label: "Large (201-1000 employees)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+ employees)" },
];

const INDUSTRIES = [
  "Construction",
  "Manufacturing",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Landscaping",
  "Painting",
  "Carpentry",
  "Welding",
  "Roofing",
  "General Contracting",
  "Facilities Management",
  "Property Management",
  "Hospitality",
  "Healthcare",
  "Retail",
  "Transportation",
  "Warehousing",
  "Other",
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function BusinessInfoStep({
  data,
  onUpdate,
  onComplete,
  isSubmitting,
}: BusinessInfoStepProps) {
  const [formData, setFormData] = useState({
    companyName: data.companyName || "",
    companyRegistrationNumber: data.companyRegistrationNumber || "",
    phone: data.phone || "",
    industry: data.industry || "",
    companySize: data.companySize || "",
    website: data.website || "",
    description: data.description || "",
    locationCity: data.locationCity || "",
    locationState: data.locationState || "",
    locationCountry: data.locationCountry || "USA",
    logoUrl: data.logoUrl || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          folder: "profiles",
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, publicUrl } = await response.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      handleChange("logoUrl", publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Company Logo</Label>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Company logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Logo
            </Button>
            {formData.logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => handleChange("logoUrl", "")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 2MB
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          placeholder="Enter your company name"
          required
        />
      </div>

      {/* Industry & Company Size */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => handleChange("industry", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size *</Label>
          <Select
            value={formData.companySize}
            onValueChange={(value) => handleChange("companySize", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Phone & Website */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Registration Number */}
      <div className="space-y-2">
        <Label htmlFor="companyRegistrationNumber">
          Company Registration Number (Optional)
        </Label>
        <Input
          id="companyRegistrationNumber"
          value={formData.companyRegistrationNumber}
          onChange={(e) => handleChange("companyRegistrationNumber", e.target.value)}
          placeholder="e.g., EIN or state registration"
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="locationCity">City *</Label>
          <Input
            id="locationCity"
            value={formData.locationCity}
            onChange={(e) => handleChange("locationCity", e.target.value)}
            placeholder="City"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationState">State *</Label>
          <Select
            value={formData.locationState}
            onValueChange={(value) => handleChange("locationState", value)}
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Company Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Tell workers about your company, culture, and the type of work you do..."
          rows={4}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Complete Setup
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface BasicInfoStepProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
}

export function BasicInfoStep({ data, onUpdate, onNext, isFirst }: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    phone: data.phone || "",
    headline: data.headline || "",
    bio: data.bio || "",
    locationCity: data.locationCity || "",
    locationState: data.locationState || "",
    locationCountry: data.locationCountry || "USA",
    locationZipCode: data.locationZipCode || "",
    hourlyRate: data.hourlyRate || "",
    dailyRate: data.dailyRate || "",
    yearsOfExperience: data.yearsOfExperience || "",
    willingToRelocate: data.willingToRelocate || false,
    willingToTravel: data.willingToTravel || false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Professional Headline *</Label>
        <Input
          id="headline"
          placeholder="e.g., Licensed Plumber with 10+ years experience"
          value={formData.headline}
          onChange={(e) => handleChange("headline", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About You</Label>
        <Textarea
          id="bio"
          placeholder="Tell potential employers about yourself, your experience, and what makes you stand out..."
          rows={4}
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="locationCity">City *</Label>
          <Input
            id="locationCity"
            value={formData.locationCity}
            onChange={(e) => handleChange("locationCity", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationState">State *</Label>
          <Input
            id="locationState"
            value={formData.locationState}
            onChange={(e) => handleChange("locationState", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="locationCountry">Country</Label>
          <Select
            value={formData.locationCountry}
            onValueChange={(value) => handleChange("locationCountry", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="CAN">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="AUS">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationZipCode">ZIP Code</Label>
          <Input
            id="locationZipCode"
            value={formData.locationZipCode}
            onChange={(e) => handleChange("locationZipCode", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            min="0"
            placeholder="50"
            value={formData.hourlyRate}
            onChange={(e) => handleChange("hourlyRate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dailyRate">Daily Rate ($)</Label>
          <Input
            id="dailyRate"
            type="number"
            min="0"
            placeholder="400"
            value={formData.dailyRate}
            onChange={(e) => handleChange("dailyRate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Select
            value={formData.yearsOfExperience}
            onValueChange={(value) => handleChange("yearsOfExperience", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Less than 1 year</SelectItem>
              <SelectItem value="1">1-2 years</SelectItem>
              <SelectItem value="3">3-5 years</SelectItem>
              <SelectItem value="6">6-10 years</SelectItem>
              <SelectItem value="10">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="willingToRelocate"
            checked={formData.willingToRelocate}
            onCheckedChange={(checked) => handleChange("willingToRelocate", checked)}
          />
          <Label htmlFor="willingToRelocate" className="font-normal">
            I&apos;m willing to relocate for work
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="willingToTravel"
            checked={formData.willingToTravel}
            onCheckedChange={(checked) => handleChange("willingToTravel", checked)}
          />
          <Label htmlFor="willingToTravel" className="font-normal">
            I&apos;m willing to travel for work
          </Label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

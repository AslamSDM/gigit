"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Award,
  Languages,
  FileText,
  DollarSign,
  Calendar,
  Star,
  Edit,
  Loader2,
  ExternalLink,
  Globe,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface WorkerProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  headline: string | null;
  bio: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationZipCode: string | null;
  hourlyRate: number | null;
  dailyRate: number | null;
  yearsOfExperience: number | null;
  availabilityStatus: string;
  willingToRelocate: boolean;
  willingToTravel: boolean;
  verificationStatus: string;
  ratingAverage: number | null;
  totalJobsCompleted: number;
  createdAt: string;
  user: {
    email: string;
    image: string | null;
    createdAt: string;
  };
  skills: {
    id: string;
    proficiencyLevel: string;
    yearsOfExperience: number | null;
    skill: {
      id: string;
      name: string;
      category: string;
    };
  }[];
  workExperiences: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }[];
  educations: {
    id: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startDate: string | null;
    endDate: string | null;
  }[];
  licenses: {
    id: string;
    name: string;
    issuingAuthority: string;
    licenseNumber: string | null;
    issueDate: string | null;
    expiryDate: string | null;
    state: string | null;
    documentUrl: string | null;
    verificationStatus: string;
  }[];
  languages: {
    id: string;
    proficiency: string;
    language: {
      id: string;
      name: string;
    };
  }[];
  certifications: {
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string | null;
    certificateUrl: string | null;
  }[];
  portfolioItems: {
    id: string;
    title: string;
    description: string | null;
    projectDate: string;
    images: {
      id: string;
      imageUrl: string;
      displayOrder: number;
    }[];
  }[];
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const availabilityLabels: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Available", color: "bg-green-100 text-green-800" },
  BUSY: { label: "Busy", color: "bg-yellow-100 text-yellow-800" },
  NOT_AVAILABLE: { label: "Not Available", color: "bg-red-100 text-red-800" },
};

const proficiencyLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/workers/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || "",
          headline: data.headline || "",
          bio: data.bio || "",
          locationCity: data.locationCity || "",
          locationState: data.locationState || "",
          locationCountry: data.locationCountry || "USA",
          locationZipCode: data.locationZipCode || "",
          hourlyRate: data.hourlyRate?.toString() || "",
          dailyRate: data.dailyRate?.toString() || "",
          yearsOfExperience: data.yearsOfExperience?.toString() || "",
          willingToRelocate: data.willingToRelocate,
          willingToTravel: data.willingToTravel,
          availabilityStatus: data.availabilityStatus,
          linkedinUrl: data.linkedinUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-lg text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.user.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.verificationStatus === "VERIFIED" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                {profile.headline && (
                  <p className="text-lg text-muted-foreground">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  {profile.locationCity && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.locationCity}, {profile.locationState}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profile.user.email}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {profile.phone}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={availabilityLabels[profile.availabilityStatus].color}>
                    {availabilityLabels[profile.availabilityStatus].label}
                  </Badge>
                  {profile.willingToRelocate && (
                    <Badge variant="outline">Willing to Relocate</Badge>
                  )}
                  {profile.willingToTravel && (
                    <Badge variant="outline">Willing to Travel</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your personal information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editData.firstName}
                          onChange={(e) =>
                            setEditData({ ...editData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editData.lastName}
                          onChange={(e) =>
                            setEditData({ ...editData, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headline">Professional Headline</Label>
                      <Input
                        id="headline"
                        value={editData.headline}
                        onChange={(e) =>
                          setEditData({ ...editData, headline: e.target.value })
                        }
                        placeholder="e.g., Licensed Master Plumber with 10+ years experience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">About</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) =>
                          setEditData({ ...editData, bio: e.target.value })
                        }
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) =>
                            setEditData({ ...editData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                        <Input
                          id="linkedinUrl"
                          value={editData.linkedinUrl}
                          onChange={(e) =>
                            setEditData({ ...editData, linkedinUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="locationCity">City</Label>
                        <Input
                          id="locationCity"
                          value={editData.locationCity}
                          onChange={(e) =>
                            setEditData({ ...editData, locationCity: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationState">State</Label>
                        <Select
                          value={editData.locationState}
                          onValueChange={(value) =>
                            setEditData({ ...editData, locationState: value })
                          }
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
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={editData.hourlyRate}
                          onChange={(e) =>
                            setEditData({ ...editData, hourlyRate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                        <Input
                          id="dailyRate"
                          type="number"
                          value={editData.dailyRate}
                          onChange={(e) =>
                            setEditData({ ...editData, dailyRate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          value={editData.yearsOfExperience}
                          onChange={(e) =>
                            setEditData({ ...editData, yearsOfExperience: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <Select
                        value={editData.availabilityStatus}
                        onValueChange={(value) =>
                          setEditData({ ...editData, availabilityStatus: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="BUSY">Busy</SelectItem>
                          <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="willingToRelocate"
                          checked={editData.willingToRelocate}
                          onCheckedChange={(checked) =>
                            setEditData({ ...editData, willingToRelocate: checked })
                          }
                        />
                        <Label htmlFor="willingToRelocate">Willing to Relocate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="willingToTravel"
                          checked={editData.willingToTravel}
                          onCheckedChange={(checked) =>
                            setEditData({ ...editData, willingToTravel: checked })
                          }
                        />
                        <Label htmlFor="willingToTravel">Willing to Travel</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-4 text-sm">
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Resume
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.yearsOfExperience || 0}</p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.totalJobsCompleted}</p>
              <p className="text-sm text-muted-foreground">Jobs Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold flex items-center justify-center">
                {profile.ratingAverage ? profile.ratingAverage.toFixed(1) : "N/A"}
                {profile.ratingAverage && (
                  <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                )}
              </p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {profile.hourlyRate ? `$${profile.hourlyRate}` : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground">No bio added yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.languages.length > 0 ? (
                  <div className="space-y-2">
                    {profile.languages.map((lang) => (
                      <div key={lang.id} className="flex items-center justify-between">
                        <span>{lang.language.name}</span>
                        <Badge variant="outline">{lang.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No languages added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Your professional skills and expertise</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.skills.map((ws) => (
                    <div
                      key={ws.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{ws.skill.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ws.skill.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {proficiencyLabels[ws.proficiencyLevel]}
                        </Badge>
                        {ws.yearsOfExperience && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {ws.yearsOfExperience} yrs
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.workExperiences.length > 0 ? (
                <div className="space-y-6">
                  {profile.workExperiences.map((exp, index) => (
                    <div
                      key={exp.id}
                      className={`flex space-x-4 ${
                        index !== profile.workExperiences.length - 1
                          ? "pb-6 border-b"
                          : ""
                      }`}
                    >
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {exp.location && (
                            <>
                              <MapPin className="h-3 w-3" />
                              <span>{exp.location}</span>
                              <span>·</span>
                            </>
                          )}
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                            {exp.isCurrent
                              ? "Present"
                              : exp.endDate
                              ? format(new Date(exp.endDate), "MMM yyyy")
                              : ""}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-sm">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No work experience added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licenses Tab */}
        <TabsContent value="licenses">
          <Card>
            <CardHeader>
              <CardTitle>Licenses & Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.licenses.length > 0 || profile.certifications.length > 0 ? (
                <div className="space-y-4">
                  {profile.licenses.map((lic) => (
                    <div key={lic.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{lic.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lic.issuingAuthority}
                              {lic.state && ` · ${lic.state}`}
                            </p>
                          </div>
                          {lic.verificationStatus === "VERIFIED" && (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {lic.licenseNumber && <span>License #: {lic.licenseNumber}</span>}
                          {lic.expiryDate && (
                            <span>Expires: {format(new Date(lic.expiryDate), "MMM yyyy")}</span>
                          )}
                        </div>
                        {lic.documentUrl && (
                          <a
                            href={lic.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View Document
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {profile.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuingOrganization}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Issued: {format(new Date(cert.issueDate), "MMM yyyy")}
                          {cert.expiryDate &&
                            ` · Expires: ${format(new Date(cert.expiryDate), "MMM yyyy")}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No licenses or certifications added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Showcase of your past projects and work</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.portfolioItems.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      {item.images.length > 0 && (
                        <img
                          src={item.images[0].imageUrl}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(item.projectDate), "MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No portfolio items added yet.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/profile/portfolio">Add Portfolio Item</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

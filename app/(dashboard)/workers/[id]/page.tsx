"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Award,
  Calendar,
  Star,
  Loader2,
  ExternalLink,
  Globe,
  CheckCircle,
  ArrowLeft,
  Send,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

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
    state: string | null;
    expiryDate: string | null;
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

export default function WorkerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/workers/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          setError("Worker profile not found");
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: profile?.id,
          content: message,
        }),
      });

      if (response.ok) {
        setIsContactOpen(false);
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-lg text-muted-foreground mb-4">{error || "Profile not found"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

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
                    <Clock className="h-4 w-4 mr-1" />
                    Member since {format(new Date(profile.user.createdAt), "MMM yyyy")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={availabilityLabels[profile.availabilityStatus]?.color || "bg-gray-100"}>
                    {availabilityLabels[profile.availabilityStatus]?.label || profile.availabilityStatus}
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
            <div className="flex flex-col gap-2">
              <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Contact Worker
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact {profile.firstName}</DialogTitle>
                    <DialogDescription>
                      Send a message to start a conversation about potential work opportunities.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, I'm interested in discussing a potential job opportunity..."
                      rows={5}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsContactOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
                        {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Send Message
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-4 text-sm">
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
          <TabsTrigger value="skills">Skills ({profile.skills.length})</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({profile.portfolioItems.length})</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground">No bio provided.</p>
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
                  <p className="text-muted-foreground">No languages listed.</p>
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
              <CardDescription>Professional skills and expertise</CardDescription>
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
                          {proficiencyLabels[ws.proficiencyLevel] || ws.proficiencyLevel}
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
                <p className="text-muted-foreground">No skills listed.</p>
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
                <p className="text-muted-foreground">No work experience listed.</p>
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
                        {lic.expiryDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Expires: {format(new Date(lic.expiryDate), "MMM yyyy")}
                          </p>
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
                  No licenses or certifications listed.
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
              <CardDescription>Past projects and completed work</CardDescription>
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
                <p className="text-muted-foreground">
                  No portfolio items available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Bookmark,
  BookmarkCheck,
  Building2,
  AlertCircle,
  Calendar,
  Globe,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Send,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  jobType: string;
  numberOfWorkersNeeded: number;
  budgetMin: number | null;
  budgetMax: number | null;
  paymentType: string;
  locationType: string;
  jobLocationCity: string | null;
  jobLocationState: string | null;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  urgency: string;
  publishedAt: string;
  expiresAt: string | null;
  requiredSkillsData: { id: string; name: string; category: string }[];
  hasApplied: boolean;
  isSaved: boolean;
  application: {
    id: string;
    status: string;
    appliedAt: string;
  } | null;
  business: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    description: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationCountry: string | null;
    industry: string | null;
    companySize: string | null;
    website: string | null;
    verificationStatus: string;
  };
  _count: {
    applications: number;
  };
}

const urgencyColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const applicationStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ACCEPTED: "bg-green-100 text-green-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

const locationTypeLabels: Record<string, string> = {
  ON_SITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const paymentTypeLabels: Record<string, string> = {
  HOURLY: "per hour",
  DAILY: "per day",
  FIXED: "fixed price",
};

const companySizeLabels: Record<string, string> = {
  SMALL: "1-50 employees",
  MEDIUM: "51-200 employees",
  LARGE: "201-1000 employees",
  ENTERPRISE: "1000+ employees",
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);
          setIsSaved(data.isSaved);
        } else if (response.status === 404) {
          router.push("/jobs");
        }
      } catch (error) {
        console.error("Failed to fetch job:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId, router]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
      });
      if (response.ok) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleUnsave = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "DELETE",
      });
      if (response.ok) {
        setIsSaved(false);
      }
    } catch (error) {
      console.error("Failed to unsave job:", error);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setApplyError("");

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter,
          proposedRate: proposedRate || null,
        }),
      });

      if (response.ok) {
        const application = await response.json();
        setJob((prev) =>
          prev
            ? {
                ...prev,
                hasApplied: true,
                application: {
                  id: application.id,
                  status: application.status,
                  appliedAt: application.appliedAt,
                },
              }
            : null
        );
        setShowApplyDialog(false);
        setCoverLetter("");
        setProposedRate("");
      } else {
        const data = await response.json();
        setApplyError(data.error || "Failed to submit application");
      }
    } catch (error) {
      setApplyError("Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  const formatBudget = () => {
    if (!job) return "";
    if (!job.budgetMin && !job.budgetMax) return "Negotiable";
    if (job.budgetMin && job.budgetMax) {
      return `$${job.budgetMin.toLocaleString()} - $${job.budgetMax.toLocaleString()}`;
    }
    if (job.budgetMin) return `From $${job.budgetMin.toLocaleString()}`;
    return `Up to $${job.budgetMax?.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {job.business.logoUrl ? (
                      <img
                        src={job.business.logoUrl}
                        alt={job.business.companyName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg text-muted-foreground">
                        {job.business.companyName}
                      </span>
                      {job.business.verificationStatus === "VERIFIED" && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className={urgencyColors[job.urgency]}>
                  {job.urgency === "URGENT" && (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {job.urgency}
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {job.jobLocationCity && job.jobLocationState
                      ? `${job.jobLocationCity}, ${job.jobLocationState}`
                      : locationTypeLabels[job.locationType]}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {formatBudget()} {paymentTypeLabels[job.paymentType]}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{job.jobType === "BULK" ? "Bulk Hiring" : "Individual"}</span>
                </div>
                {job.jobType === "BULK" && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.numberOfWorkersNeeded} workers needed</span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Posted{" "}
                  {formatDistanceToNow(new Date(job.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
                {job.startDate && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Starts {format(new Date(job.startDate), "MMM d, yyyy")}
                  </span>
                )}
                {job.durationDays && (
                  <span>Duration: {job.durationDays} days</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                {job.hasApplied ? (
                  <div className="flex items-center gap-3">
                    <Badge
                      className={applicationStatusColors[job.application?.status || "PENDING"]}
                    >
                      Application {job.application?.status.toLowerCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Applied{" "}
                      {formatDistanceToNow(new Date(job.application?.appliedAt || ""), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ) : (
                  <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                    <DialogTrigger asChild>
                      <Button size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Apply to {job.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application to {job.business.companyName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="coverLetter">
                            Cover Letter (Optional)
                          </Label>
                          <Textarea
                            id="coverLetter"
                            placeholder="Tell them why you're a great fit for this job..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proposedRate">
                            Proposed Rate (Optional)
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="proposedRate"
                              type="number"
                              placeholder="Your proposed rate"
                              value={proposedRate}
                              onChange={(e) => setProposedRate(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Budget: {formatBudget()} {paymentTypeLabels[job.paymentType]}
                          </p>
                        </div>
                        {applyError && (
                          <p className="text-sm text-destructive">{applyError}</p>
                        )}
                        <Button
                          className="w-full"
                          onClick={handleApply}
                          disabled={isApplying}
                        >
                          {isApplying && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Submit Application
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={isSaved ? handleUnsave : handleSave}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save Job
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {job.requiredSkillsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkillsData.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  {job.business.logoUrl ? (
                    <img
                      src={job.business.logoUrl}
                      alt={job.business.companyName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{job.business.companyName}</h3>
                  {job.business.industry && (
                    <p className="text-sm text-muted-foreground">
                      {job.business.industry}
                    </p>
                  )}
                </div>
              </div>

              {job.business.description && (
                <p className="text-sm text-muted-foreground">
                  {job.business.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {(job.business.locationCity || job.business.locationState) && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {[
                        job.business.locationCity,
                        job.business.locationState,
                        job.business.locationCountry,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {job.business.companySize && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{companySizeLabels[job.business.companySize]}</span>
                  </div>
                )}
                {job.business.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a
                      href={job.business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">{job._count.applications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-medium">
                    {format(new Date(job.publishedAt), "MMM d, yyyy")}
                  </span>
                </div>
                {job.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">
                      {format(new Date(job.expiresAt), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Similar Jobs - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                More jobs like this will appear here.
              </p>
              <Button variant="link" className="px-0 mt-2" asChild>
                <Link href="/jobs">Browse all jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  Mail,
  Phone,
  FileText,
  Award,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  proposedRate: number | null;
  appliedAt: string;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    headline: string | null;
    bio: string | null;
    resumeUrl: string | null;
    locationCity: string | null;
    locationState: string | null;
    hourlyRate: number | null;
    dailyRate: number | null;
    yearsOfExperience: number | null;
    ratingAverage: number | null;
    totalJobsCompleted: number;
    verificationStatus: string;
    user: {
      email: string;
      image: string | null;
    };
    skills: {
      id: string;
      proficiencyLevel: string;
      skill: {
        id: string;
        name: string;
      };
    }[];
    workExperiences: {
      id: string;
      title: string;
      company: string;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
    }[];
    licenses: {
      id: string;
      name: string;
      issuingAuthority: string;
      state: string | null;
    }[];
  };
}

interface Job {
  id: string;
  title: string;
  status: string;
  paymentType: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-purple-100 text-purple-800",
  REJECTED: "bg-red-100 text-red-800",
  ACCEPTED: "bg-green-100 text-green-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/business/jobs/${jobId}/applications`),
      ]);

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
      }
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/business/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status } : app
          )
        );
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status });
        }
      }
    } catch (error) {
      console.error("Failed to update application:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true;
    return app.status === activeTab.toUpperCase();
  });

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/business/jobs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground mt-1">
          {job?.title} · {applications.length} applicant
          {applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="shortlisted">
            Shortlisted ({counts.shortlisted})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({counts.accepted})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({counts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No applications in this category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedApplication(application)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.worker.user.image || undefined} />
                          <AvatarFallback>
                            {application.worker.firstName[0]}
                            {application.worker.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {application.worker.firstName} {application.worker.lastName}
                          </h3>
                          {application.worker.headline && (
                            <p className="text-sm text-muted-foreground">
                              {application.worker.headline}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            {application.worker.locationCity && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {application.worker.locationCity},{" "}
                                {application.worker.locationState}
                              </span>
                            )}
                            {application.worker.yearsOfExperience && (
                              <span>
                                {application.worker.yearsOfExperience} yrs exp
                              </span>
                            )}
                            {application.worker.ratingAverage && (
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {application.worker.ratingAverage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors[application.status]}>
                          {application.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          Applied{" "}
                          {formatDistanceToNow(new Date(application.appliedAt), {
                            addSuffix: true,
                          })}
                        </p>
                        {application.proposedRate && (
                          <p className="text-sm font-medium mt-1">
                            ${application.proposedRate}/
                            {job?.paymentType === "HOURLY"
                              ? "hr"
                              : job?.paymentType === "DAILY"
                              ? "day"
                              : "project"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {application.worker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {application.worker.skills.slice(0, 5).map((ws) => (
                          <Badge key={ws.id} variant="outline" className="text-xs">
                            {ws.skill.name}
                          </Badge>
                        ))}
                        {application.worker.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.worker.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      {application.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateApplicationStatus(application.id, "SHORTLISTED");
                            }}
                            disabled={isUpdating}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateApplicationStatus(application.id, "REJECTED");
                            }}
                            disabled={isUpdating}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === "SHORTLISTED" && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateApplicationStatus(application.id, "ACCEPTED");
                            }}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateApplicationStatus(application.id, "REJECTED");
                            }}
                            disabled={isUpdating}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={() => setSelectedApplication(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Applicant Profile</DialogTitle>
                <DialogDescription>
                  Review the applicant's qualifications and experience
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedApplication.worker.user.image || undefined}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedApplication.worker.firstName[0]}
                      {selectedApplication.worker.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {selectedApplication.worker.firstName}{" "}
                          {selectedApplication.worker.lastName}
                        </h2>
                        {selectedApplication.worker.headline && (
                          <p className="text-muted-foreground">
                            {selectedApplication.worker.headline}
                          </p>
                        )}
                      </div>
                      <Badge className={statusColors[selectedApplication.status]}>
                        {selectedApplication.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      {selectedApplication.worker.locationCity && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedApplication.worker.locationCity},{" "}
                          {selectedApplication.worker.locationState}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedApplication.worker.user.email}
                      </span>
                      {selectedApplication.worker.phone && (
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {selectedApplication.worker.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedApplication.worker.yearsOfExperience || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Years Exp</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedApplication.worker.totalJobsCompleted}
                    </p>
                    <p className="text-sm text-muted-foreground">Jobs Done</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold flex items-center justify-center">
                      {selectedApplication.worker.ratingAverage || "N/A"}
                      {selectedApplication.worker.ratingAverage && (
                        <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold mb-2">Cover Letter</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                {/* Proposed Rate */}
                {selectedApplication.proposedRate && (
                  <div className="flex items-center p-3 bg-muted rounded-lg">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">
                        Proposed Rate: ${selectedApplication.proposedRate}
                        {job?.paymentType === "HOURLY"
                          ? "/hour"
                          : job?.paymentType === "DAILY"
                          ? "/day"
                          : " (fixed)"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedApplication.worker.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.worker.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {selectedApplication.worker.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.worker.skills.map((ws) => (
                        <Badge key={ws.id} variant="secondary">
                          {ws.skill.name} · {ws.proficiencyLevel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {selectedApplication.worker.workExperiences.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Work Experience</h3>
                    <div className="space-y-3">
                      {selectedApplication.worker.workExperiences.map((exp) => (
                        <div key={exp.id} className="flex items-start space-x-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{exp.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.company}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                              {exp.isCurrent
                                ? "Present"
                                : exp.endDate
                                ? format(new Date(exp.endDate), "MMM yyyy")
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Licenses */}
                {selectedApplication.worker.licenses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Licenses & Certifications</h3>
                    <div className="space-y-2">
                      {selectedApplication.worker.licenses.map((lic) => (
                        <div key={lic.id} className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{lic.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {lic.issuingAuthority}
                              {lic.state && ` · ${lic.state}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {selectedApplication.worker.resumeUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={selectedApplication.worker.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  {selectedApplication.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() =>
                          updateApplicationStatus(selectedApplication.id, "SHORTLISTED")
                        }
                        disabled={isUpdating}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Shortlist
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          updateApplicationStatus(selectedApplication.id, "REJECTED")
                        }
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === "SHORTLISTED" && (
                    <>
                      <Button
                        onClick={() =>
                          updateApplicationStatus(selectedApplication.id, "ACCEPTED")
                        }
                        disabled={isUpdating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept & Hire
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          updateApplicationStatus(selectedApplication.id, "REJECTED")
                        }
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

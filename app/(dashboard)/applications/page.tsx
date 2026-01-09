"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  proposedRate: number | null;
  appliedAt: string;
  reviewedAt: string | null;
  jobPost: {
    id: string;
    title: string;
    status: string;
    budgetMin: number | null;
    budgetMax: number | null;
    paymentType: string;
    locationType: string;
    jobLocationCity: string | null;
    jobLocationState: string | null;
    business: {
      id: string;
      companyName: string;
      logoUrl: string | null;
      locationCity: string | null;
      locationState: string | null;
    };
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-purple-100 text-purple-800",
  REJECTED: "bg-red-100 text-red-800",
  ACCEPTED: "bg-green-100 text-green-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

const statusDescriptions: Record<string, string> = {
  PENDING: "Waiting for review",
  REVIEWED: "Application reviewed",
  SHORTLISTED: "You've been shortlisted!",
  REJECTED: "Not selected",
  ACCEPTED: "Congratulations! You're hired!",
  WITHDRAWN: "Application withdrawn",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/workers/applications");
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["PENDING", "REVIEWED", "SHORTLISTED"].includes(app.status);
    if (activeTab === "accepted") return app.status === "ACCEPTED";
    if (activeTab === "rejected") return app.status === "REJECTED";
    return true;
  });

  const counts = {
    all: applications.length,
    active: applications.filter((a) =>
      ["PENDING", "REVIEWED", "SHORTLISTED"].includes(a.status)
    ).length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const formatBudget = (job: Application["jobPost"]) => {
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your job applications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({counts.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              {applications.length === 0 ? (
                <>
                  <p className="text-lg text-muted-foreground mb-4">
                    You haven't applied to any jobs yet
                  </p>
                  <Button asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </>
              ) : (
                <p className="text-lg text-muted-foreground">
                  No applications in this category
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {application.jobPost.business.logoUrl ? (
                            <img
                              src={application.jobPost.business.logoUrl}
                              alt={application.jobPost.business.companyName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/jobs/${application.jobPost.id}`}
                            className="text-lg font-semibold hover:text-primary"
                          >
                            {application.jobPost.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {application.jobPost.business.companyName}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            {(application.jobPost.jobLocationCity ||
                              application.jobPost.jobLocationState) && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {[
                                  application.jobPost.jobLocationCity,
                                  application.jobPost.jobLocationState,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            )}
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatBudget(application.jobPost)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors[application.status]}>
                          {application.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {statusDescriptions[application.status]}
                        </p>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Applied{" "}
                            {formatDistanceToNow(new Date(application.appliedAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {application.proposedRate && (
                            <span>
                              Your rate: ${application.proposedRate}/
                              {application.jobPost.paymentType === "HOURLY"
                                ? "hr"
                                : application.jobPost.paymentType === "DAILY"
                                ? "day"
                                : "project"}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${application.jobPost.id}`}>
                            View Job
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Link>
                        </Button>
                      </div>

                      {application.coverLetter && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Your Cover Letter
                          </p>
                          <p className="text-sm line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

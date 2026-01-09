"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Loader2, Bookmark } from "lucide-react";

interface SavedJob {
  id: string;
  jobPostId: string;
  createdAt: string;
  jobPost: {
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
    urgency: string;
    publishedAt: string;
    status: string;
    requiredSkillsData?: { id: string; name: string; category: string }[];
    business: {
      id: string;
      companyName: string;
      logoUrl: string | null;
      locationCity: string | null;
      locationState: string | null;
      verificationStatus: string;
    };
    _count: {
      applications: number;
    };
  };
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("/api/workers/saved-jobs");
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSavedJobs((prev) => prev.filter((sj) => sj.jobPostId !== jobId));
      }
    } catch (error) {
      console.error("Failed to unsave job:", error);
    }
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
        <h1 className="text-3xl font-bold">Saved Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Jobs you've saved for later
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-4">
            You haven't saved any jobs yet
          </p>
          <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <JobCard
              key={savedJob.id}
              job={savedJob.jobPost}
              isSaved={true}
              onUnsave={() => handleUnsave(savedJob.jobPostId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

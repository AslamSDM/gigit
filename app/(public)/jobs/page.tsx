"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface Job {
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
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    skills: searchParams.get("skills")?.split(",").filter(Boolean) || [],
    jobType: searchParams.get("jobType") || "",
    locationType: searchParams.get("locationType") || "",
    paymentType: searchParams.get("paymentType") || "",
    urgency: searchParams.get("urgency") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    minBudget: searchParams.get("minBudget") || "",
    maxBudget: searchParams.get("maxBudget") || "",
    sortBy: searchParams.get("sortBy") || "newest",
  });

  // Fetch skills on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/skills");
        if (response.ok) {
          const data = await response.json();
          setSkills(data);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };
    fetchSkills();
  }, []);

  // Fetch saved jobs only if authenticated
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (status !== "authenticated") return;
      try {
        const response = await fetch("/api/workers/saved-jobs");
        if (response.ok) {
          const data = await response.json();
          setSavedJobIds(new Set(data.map((sj: any) => sj.jobPostId)));
        }
      } catch (error) {
        // User might not have a worker profile
      }
    };
    fetchSavedJobs();
  }, [status]);

  // Fetch jobs when filters change
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      if (filters.search) params.set("search", filters.search);
      if (filters.skills.length > 0) params.set("skills", filters.skills.join(","));
      if (filters.jobType) params.set("jobType", filters.jobType);
      if (filters.locationType) params.set("locationType", filters.locationType);
      if (filters.paymentType) params.set("paymentType", filters.paymentType);
      if (filters.urgency) params.set("urgency", filters.urgency);
      if (filters.city) params.set("city", filters.city);
      if (filters.state) params.set("state", filters.state);
      if (filters.minBudget) params.set("minBudget", filters.minBudget);
      if (filters.maxBudget) params.set("maxBudget", filters.maxBudget);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.skills.length > 0) params.set("skills", filters.skills.join(","));
    if (filters.jobType) params.set("jobType", filters.jobType);
    if (filters.locationType) params.set("locationType", filters.locationType);
    if (filters.paymentType) params.set("paymentType", filters.paymentType);
    if (filters.urgency) params.set("urgency", filters.urgency);
    if (filters.city) params.set("city", filters.city);
    if (filters.state) params.set("state", filters.state);
    if (filters.minBudget) params.set("minBudget", filters.minBudget);
    if (filters.maxBudget) params.set("maxBudget", filters.maxBudget);
    if (filters.sortBy && filters.sortBy !== "newest")
      params.set("sortBy", filters.sortBy);

    const queryString = params.toString();
    router.replace(`/jobs${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filters, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSaveJob = async (jobId: string) => {
    if (status !== "authenticated") {
      setShowLoginDialog(true);
      return;
    }
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
      });
      if (response.ok) {
        setSavedJobIds((prev) => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    if (status !== "authenticated") {
      setShowLoginDialog(true);
      return;
    }
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSavedJobIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to unsave job:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Work</h1>
        <p className="text-muted-foreground">
          Browse available jobs and find the perfect opportunity
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, description, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="font-semibold mb-4">Filters</h2>
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              skills={skills}
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-3">
          {/* Results count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Showing {jobs.length} of {pagination.total} job
                {pagination.total !== 1 ? "s" : ""}
              </>
            )}
          </div>

          {/* Job Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No jobs found matching your criteria
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  handleFilterChange({
                    search: "",
                    skills: [],
                    jobType: "",
                    locationType: "",
                    paymentType: "",
                    urgency: "",
                    city: "",
                    state: "",
                    minBudget: "",
                    maxBudget: "",
                    sortBy: "newest",
                  })
                }
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  onSave={() => handleSaveJob(job.id)}
                  onUnsave={() => handleUnsaveJob(job.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to sign in to save jobs. Create a free account to save jobs
              and apply to opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button asChild>
              <Link href="/login?callbackUrl=/jobs">Sign in</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

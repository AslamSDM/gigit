"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  Loader2,
  Briefcase,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Job {
  id: string;
  title: string;
  status: string;
  jobType: string;
  numberOfWorkersNeeded: number;
  locationType: string;
  jobLocationCity: string | null;
  jobLocationState: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  paymentType: string;
  urgency: string;
  publishedAt: string | null;
  createdAt: string;
  _count: {
    applications: number;
  };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const urgencyColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export default function BusinessJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const response = await fetch(`/api/business/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatBudget = (job: Job) => {
    if (!job.budgetMin && !job.budgetMax) return "Negotiable";
    if (job.budgetMin && job.budgetMax) {
      return `$${job.budgetMin.toLocaleString()} - $${job.budgetMax.toLocaleString()}`;
    }
    if (job.budgetMin) return `From $${job.budgetMin.toLocaleString()}`;
    return `Up to $${job.budgetMax?.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job postings and view applications
          </p>
        </div>
        <Button asChild>
          <Link href="/business/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          {jobs.length === 0 ? (
            <>
              <p className="text-lg text-muted-foreground mb-4">
                You haven't posted any jobs yet
              </p>
              <Button asChild>
                <Link href="/business/jobs/new">Post Your First Job</Link>
              </Button>
            </>
          ) : (
            <p className="text-lg text-muted-foreground">
              No jobs match your search criteria
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/business/jobs/${job.id}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={statusColors[job.status]}>
                            {job.status}
                          </Badge>
                          <Badge className={urgencyColors[job.urgency]}>
                            {job.urgency}
                          </Badge>
                          {job.jobType === "BULK" && (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {job.numberOfWorkersNeeded} workers
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/business/jobs/${job.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/business/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Job
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      {(job.jobLocationCity || job.jobLocationState) && (
                        <span>
                          {[job.jobLocationCity, job.jobLocationState]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      <span>{formatBudget(job)}</span>
                      <span>
                        {job.paymentType === "HOURLY"
                          ? "per hour"
                          : job.paymentType === "DAILY"
                          ? "per day"
                          : "fixed price"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.publishedAt
                            ? `Posted ${formatDistanceToNow(new Date(job.publishedAt), { addSuffix: true })}`
                            : `Created ${formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}`}
                        </span>
                        <Link
                          href={`/business/jobs/${job.id}/applications`}
                          className="flex items-center hover:text-primary"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {job._count.applications} applicant
                          {job._count.applications !== 1 ? "s" : ""}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/business/jobs/${job.id}/applications`}>
                            View Applications
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

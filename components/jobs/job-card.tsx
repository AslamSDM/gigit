"use client";

import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Bookmark,
  BookmarkCheck,
  Building2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  job: {
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
  };
  isSaved?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
}

const urgencyColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const locationTypeLabels: Record<string, string> = {
  ON_SITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const paymentTypeLabels: Record<string, string> = {
  HOURLY: "Hourly",
  DAILY: "Daily",
  FIXED: "Fixed Price",
};

export function JobCard({ job, isSaved, onSave, onUnsave }: JobCardProps) {
  const formatBudget = () => {
    if (!job.budgetMin && !job.budgetMax) return "Negotiable";
    if (job.budgetMin && job.budgetMax) {
      return `$${job.budgetMin.toLocaleString()} - $${job.budgetMax.toLocaleString()}`;
    }
    if (job.budgetMin) return `From $${job.budgetMin.toLocaleString()}`;
    return `Up to $${job.budgetMax?.toLocaleString()}`;
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
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

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-lg font-semibold hover:text-primary transition-colors"
                  >
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {job.business.companyName}
                    </span>
                    {job.business.verificationStatus === "VERIFIED" && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge className={urgencyColors[job.urgency]}>
                  {job.urgency === "URGENT" && (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {job.urgency}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                {truncateDescription(job.description)}
              </p>

              {/* Skills */}
              {job.requiredSkillsData && job.requiredSkillsData.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.requiredSkillsData.slice(0, 5).map((skill) => (
                    <Badge key={skill.id} variant="outline" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                  {job.requiredSkillsData.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.requiredSkillsData.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                {(job.jobLocationCity || job.jobLocationState) && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {[job.jobLocationCity, job.jobLocationState]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatBudget()} ({paymentTypeLabels[job.paymentType]})
                </span>
                {job.jobType === "BULK" && (
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {job.numberOfWorkersNeeded} workers needed
                  </span>
                )}
                <span>{locationTypeLabels[job.locationType]}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Posted{" "}
                  {formatDistanceToNow(new Date(job.publishedAt), {
                    addSuffix: true,
                  })}
                  <span className="mx-2">·</span>
                  {job._count.applications} applicant
                  {job._count.applications !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      isSaved ? onUnsave?.() : onSave?.();
                    }}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

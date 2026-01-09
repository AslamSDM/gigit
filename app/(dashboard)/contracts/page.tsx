"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";

interface Contract {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  agreedRate: number | null;
  createdAt: string;
  jobPost: {
    id: string;
    title: string;
    jobType: string;
    paymentType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    startDate: string | null;
    endDate: string | null;
  };
  business: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    locationCity: string | null;
    locationState: string | null;
  };
}

interface ContractsResponse {
  contracts: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
  DISPUTED: {
    label: "Disputed",
    color: "bg-orange-100 text-orange-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

export default function ContractsPage() {
  const [data, setData] = useState<ContractsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchContracts();
  }, [activeTab, page]);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(activeTab !== "all" && { status: activeTab.toUpperCase() }),
      });

      const response = await fetch(`/api/workers/contracts?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    active: data?.contracts.filter((c) => c.status === "ACTIVE").length || 0,
    pending: data?.contracts.filter((c) => c.status === "PENDING").length || 0,
    completed: data?.contracts.filter((c) => c.status === "COMPLETED").length || 0,
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Contracts</h1>
        <p className="text-muted-foreground">
          Manage your work contracts and agreements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {data && data.contracts.length > 0 ? (
            <div className="space-y-4">
              {data.contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {contract.jobPost.title}
                              </h3>
                              <Badge className={statusConfig[contract.status]?.color || "bg-gray-100"}>
                                {statusConfig[contract.status]?.label || contract.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.business.companyName}</span>
                              {contract.business.locationCity && (
                                <>
                                  <span>·</span>
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {contract.business.locationCity},{" "}
                                    {contract.business.locationState}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                              {contract.agreedRate && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">
                                    ${contract.agreedRate}
                                    {contract.jobPost.paymentType === "HOURLY"
                                      ? "/hr"
                                      : contract.jobPost.paymentType === "DAILY"
                                      ? "/day"
                                      : ""}
                                  </span>
                                </div>
                              )}
                              {contract.startDate && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(contract.startDate), "MMM d, yyyy")}
                                    {contract.endDate && (
                                      <> - {format(new Date(contract.endDate), "MMM d, yyyy")}</>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/jobs/${contract.jobPost.id}`}>View Job</Link>
                        </Button>
                        <Button asChild>
                          <Link href={`/contracts/${contract.id}`}>View Contract</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No contracts found</h3>
                <p className="text-muted-foreground text-center mt-1">
                  {activeTab === "all"
                    ? "You don't have any contracts yet. Apply to jobs to get started!"
                    : `You don't have any ${activeTab} contracts.`}
                </p>
                {activeTab === "all" && (
                  <Button className="mt-4" asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

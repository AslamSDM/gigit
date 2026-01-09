import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get business profile
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    // Get stats
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalContracts,
      activeContracts,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      prisma.jobPost.count({
        where: { businessId: businessProfile.id },
      }),
      prisma.jobPost.count({
        where: { businessId: businessProfile.id, status: "ACTIVE" },
      }),
      prisma.jobApplication.count({
        where: { jobPost: { businessId: businessProfile.id } },
      }),
      prisma.jobApplication.count({
        where: {
          jobPost: { businessId: businessProfile.id },
          status: "PENDING",
        },
      }),
      prisma.contract.count({
        where: { businessId: businessProfile.id },
      }),
      prisma.contract.count({
        where: { businessId: businessProfile.id, status: "ACTIVE" },
      }),
      prisma.jobPost.findMany({
        where: { businessId: businessProfile.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          publishedAt: true,
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.jobApplication.findMany({
        where: { jobPost: { businessId: businessProfile.id } },
        orderBy: { appliedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          appliedAt: true,
          worker: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          jobPost: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        totalContracts,
        activeContracts,
      },
      recentJobs,
      recentApplications,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

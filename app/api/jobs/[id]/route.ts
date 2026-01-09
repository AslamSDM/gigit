import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            description: true,
            locationCity: true,
            locationState: true,
            locationCountry: true,
            industry: true,
            companySize: true,
            website: true,
            verificationStatus: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get skill details
    const requiredSkills = job.requiredSkills as string[];
    const skills = await prisma.skill.findMany({
      where: { id: { in: requiredSkills } },
      select: { id: true, name: true, category: true },
    });

    // Check if current user has applied
    const session = await auth();
    let hasApplied = false;
    let isSaved = false;
    let application = null;

    if (session?.user?.id) {
      const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (workerProfile) {
        const existingApplication = await prisma.jobApplication.findUnique({
          where: {
            jobPostId_workerId: {
              jobPostId: id,
              workerId: workerProfile.id,
            },
          },
        });
        hasApplied = !!existingApplication;
        application = existingApplication;

        const savedJob = await prisma.savedJob.findUnique({
          where: {
            workerId_jobPostId: {
              workerId: workerProfile.id,
              jobPostId: id,
            },
          },
        });
        isSaved = !!savedJob;
      }
    }

    return NextResponse.json({
      ...job,
      requiredSkillsData: skills,
      hasApplied,
      isSaved,
      application,
    });
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Verify ownership
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedJob = await prisma.jobPost.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills,
        jobType: data.jobType,
        numberOfWorkersNeeded: data.numberOfWorkersNeeded,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : null,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
        paymentType: data.paymentType,
        locationType: data.locationType,
        jobLocationCity: data.jobLocationCity,
        jobLocationState: data.jobLocationState,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        durationDays: data.durationDays ? parseInt(data.durationDays) : null,
        status: data.status,
        urgency: data.urgency,
        publishedAt:
          data.status === JobStatus.ACTIVE && !job.publishedAt
            ? new Date()
            : job.publishedAt,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.jobPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

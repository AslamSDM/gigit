import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const data = await request.json();

    // Get worker profile
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Check if job exists and is active
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== JobStatus.ACTIVE) {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobPostId_workerId: {
          jobPostId: jobId,
          workerId: workerProfile.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobPostId: jobId,
        workerId: workerProfile.id,
        coverLetter: data.coverLetter || null,
        proposedRate: data.proposedRate ? parseFloat(data.proposedRate) : null,
      },
    });

    // Create notification for business
    const jobWithBusiness = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { business: { include: { user: true } } },
    });

    if (jobWithBusiness) {
      await prisma.notification.create({
        data: {
          userId: jobWithBusiness.business.userId,
          type: "JOB_APPLICATION",
          title: "New Job Application",
          message: `${workerProfile.firstName} ${workerProfile.lastName} applied to your job: ${job.title}`,
          link: `/business/jobs/${jobId}/applications`,
        },
      });
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to apply to job:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

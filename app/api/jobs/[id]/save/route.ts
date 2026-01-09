import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get worker profile
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    // Check if job exists
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        workerId_jobPostId: {
          workerId: workerProfile.id,
          jobPostId: jobId,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { error: "Job already saved" },
        { status: 400 }
      );
    }

    // Save job
    const savedJob = await prisma.savedJob.create({
      data: {
        workerId: workerProfile.id,
        jobPostId: jobId,
      },
    });

    return NextResponse.json(savedJob, { status: 201 });
  } catch (error) {
    console.error("Failed to save job:", error);
    return NextResponse.json(
      { error: "Failed to save job" },
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

    const { id: jobId } = await params;

    // Get worker profile
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    // Delete saved job
    await prisma.savedJob.delete({
      where: {
        workerId_jobPostId: {
          workerId: workerProfile.id,
          jobPostId: jobId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unsave job:", error);
    return NextResponse.json(
      { error: "Failed to unsave job" },
      { status: 500 }
    );
  }
}

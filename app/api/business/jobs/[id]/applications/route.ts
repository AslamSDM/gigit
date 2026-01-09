import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;

    // Verify job belongs to user's business
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { business: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobPostId: jobId },
      orderBy: { appliedAt: "desc" },
      include: {
        worker: {
          include: {
            user: {
              select: {
                email: true,
                image: true,
              },
            },
            skills: {
              include: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            workExperiences: {
              orderBy: { startDate: "desc" },
              take: 3,
            },
            licenses: {
              take: 5,
            },
          },
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

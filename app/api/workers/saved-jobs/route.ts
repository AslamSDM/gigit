import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const savedJobs = await prisma.savedJob.findMany({
      where: { workerId: workerProfile.id },
      include: {
        jobPost: {
          include: {
            business: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                locationCity: true,
                locationState: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get skill names for each job
    const allSkillIds = new Set<string>();
    savedJobs.forEach((sj) => {
      const requiredSkills = sj.jobPost.requiredSkills as string[];
      requiredSkills.forEach((id) => allSkillIds.add(id));
    });

    const skills = await prisma.skill.findMany({
      where: { id: { in: Array.from(allSkillIds) } },
      select: { id: true, name: true, category: true },
    });

    const skillsMap = new Map(skills.map((s) => [s.id, s]));

    const transformedJobs = savedJobs.map((sj) => {
      const requiredSkills = sj.jobPost.requiredSkills as string[];
      return {
        ...sj,
        jobPost: {
          ...sj.jobPost,
          requiredSkillsData: requiredSkills
            .map((id) => skillsMap.get(id))
            .filter(Boolean),
        },
      };
    });

    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error("Failed to fetch saved jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
      { status: 500 }
    );
  }
}

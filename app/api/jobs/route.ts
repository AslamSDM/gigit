import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skillIds = searchParams.get("skills")?.split(",").filter(Boolean) || [];
    const jobType = searchParams.get("jobType");
    const locationType = searchParams.get("locationType");
    const paymentType = searchParams.get("paymentType");
    const urgency = searchParams.get("urgency");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.JobPostWhereInput = {
      status: JobStatus.ACTIVE,
    };

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by job type
    if (jobType) {
      where.jobType = jobType as any;
    }

    // Filter by location type
    if (locationType) {
      where.locationType = locationType as any;
    }

    // Filter by payment type
    if (paymentType) {
      where.paymentType = paymentType as any;
    }

    // Filter by urgency
    if (urgency) {
      where.urgency = urgency as any;
    }

    // Filter by city/state
    if (city) {
      where.jobLocationCity = { contains: city, mode: "insensitive" };
    }
    if (state) {
      where.jobLocationState = { contains: state, mode: "insensitive" };
    }

    // Filter by budget range
    if (minBudget) {
      where.budgetMax = { gte: parseFloat(minBudget) };
    }
    if (maxBudget) {
      where.budgetMin = { lte: parseFloat(maxBudget) };
    }

    // Build orderBy clause
    let orderBy: Prisma.JobPostOrderByWithRelationInput = { publishedAt: "desc" };
    switch (sortBy) {
      case "oldest":
        orderBy = { publishedAt: "asc" };
        break;
      case "budget_high":
        orderBy = { budgetMax: "desc" };
        break;
      case "budget_low":
        orderBy = { budgetMin: "asc" };
        break;
      case "urgency":
        orderBy = { urgency: "desc" };
        break;
    }

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          business: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              locationCity: true,
              locationState: true,
              verificationStatus: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobPost.count({ where }),
    ]);

    // If skill filter is provided, filter jobs that require those skills
    let filteredJobs = jobs;
    if (skillIds.length > 0) {
      filteredJobs = jobs.filter((job) => {
        const requiredSkills = job.requiredSkills as string[];
        return skillIds.some((skillId) => requiredSkills.includes(skillId));
      });
    }

    // Get skill names for each job
    const allSkillIds = new Set<string>();
    filteredJobs.forEach((job) => {
      const requiredSkills = job.requiredSkills as string[];
      requiredSkills.forEach((id) => allSkillIds.add(id));
    });

    const skills = await prisma.skill.findMany({
      where: { id: { in: Array.from(allSkillIds) } },
      select: { id: true, name: true, category: true },
    });

    const skillsMap = new Map(skills.map((s) => [s.id, s]));

    // Transform jobs to include skill names
    const transformedJobs = filteredJobs.map((job) => {
      const requiredSkills = job.requiredSkills as string[];
      return {
        ...job,
        requiredSkillsData: requiredSkills
          .map((id) => skillsMap.get(id))
          .filter(Boolean),
      };
    });

    return NextResponse.json({
      jobs: transformedJobs,
      pagination: {
        page,
        limit,
        total: skillIds.length > 0 ? filteredJobs.length : total,
        totalPages: Math.ceil(
          (skillIds.length > 0 ? filteredJobs.length : total) / limit
        ),
      },
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.json();

    const job = await prisma.jobPost.create({
      data: {
        businessId: businessProfile.id,
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills || [],
        jobType: data.jobType,
        numberOfWorkersNeeded: data.numberOfWorkersNeeded || 1,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : null,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
        paymentType: data.paymentType,
        locationType: data.locationType,
        jobLocationCity: data.jobLocationCity,
        jobLocationState: data.jobLocationState,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        durationDays: data.durationDays ? parseInt(data.durationDays) : null,
        status: data.publish ? JobStatus.ACTIVE : JobStatus.DRAFT,
        urgency: data.urgency || "MEDIUM",
        publishedAt: data.publish ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

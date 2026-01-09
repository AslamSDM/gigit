import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

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

    const where: any = {
      businessId: businessProfile.id,
    };

    if (status) {
      where.status = status;
    }

    const jobs = await prisma.jobPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        jobType: true,
        numberOfWorkersNeeded: true,
        locationType: true,
        jobLocationCity: true,
        jobLocationState: true,
        budgetMin: true,
        budgetMax: true,
        paymentType: true,
        urgency: true,
        publishedAt: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch business jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            image: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        workExperiences: {
          orderBy: { startDate: "desc" },
        },
        educations: {
          orderBy: { startDate: "desc" },
        },
        licenses: {
          orderBy: { issueDate: "desc" },
          select: {
            id: true,
            name: true,
            issuingAuthority: true,
            state: true,
            expiryDate: true,
            verificationStatus: true,
          },
        },
        languages: {
          include: {
            language: true,
          },
        },
        certifications: {
          orderBy: { issueDate: "desc" },
          select: {
            id: true,
            name: true,
            issuingOrganization: true,
            issueDate: true,
            expiryDate: true,
          },
        },
        portfolioItems: {
          include: {
            images: {
              orderBy: { displayOrder: "asc" },
            },
          },
          orderBy: { projectDate: "desc" },
        },
      },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    // For business users, track profile view
    if (session.user.userType === "BUSINESS") {
      const businessProfile = await prisma.businessProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (businessProfile) {
        // Could add profile view tracking here
      }
    }

    return NextResponse.json(workerProfile);
  } catch (error) {
    console.error("Failed to fetch worker profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

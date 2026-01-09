import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
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
        },
        languages: {
          include: {
            language: true,
          },
        },
        certifications: {
          orderBy: { issueDate: "desc" },
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

    return NextResponse.json(workerProfile);
  } catch (error) {
    console.error("Failed to fetch worker profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    // Update profile
    const updatedProfile = await prisma.workerProfile.update({
      where: { id: workerProfile.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        headline: data.headline,
        bio: data.bio,
        locationCity: data.locationCity,
        locationState: data.locationState,
        locationCountry: data.locationCountry,
        locationZipCode: data.locationZipCode,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        dailyRate: data.dailyRate ? parseFloat(data.dailyRate) : null,
        yearsOfExperience: data.yearsOfExperience
          ? parseInt(data.yearsOfExperience)
          : null,
        willingToRelocate: data.willingToRelocate || false,
        willingToTravel: data.willingToTravel || false,
        availabilityStatus: data.availabilityStatus || "AVAILABLE",
        linkedinUrl: data.linkedinUrl,
      },
    });

    // Update user name
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Failed to update worker profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

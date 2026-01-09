import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    await prisma.$transaction(async (tx) => {
      // Update or create business profile
      await tx.businessProfile.upsert({
        where: { userId: session.user.id },
        update: {
          companyName: data.companyName,
          companyRegistrationNumber: data.companyRegistrationNumber || null,
          phone: data.phone || null,
          industry: data.industry || null,
          companySize: data.companySize || null,
          website: data.website || null,
          logoUrl: data.logoUrl || null,
          description: data.description || null,
          locationCity: data.locationCity || null,
          locationState: data.locationState || null,
          locationCountry: data.locationCountry || "USA",
        },
        create: {
          userId: session.user.id,
          companyName: data.companyName,
          companyRegistrationNumber: data.companyRegistrationNumber || null,
          phone: data.phone || null,
          industry: data.industry || null,
          companySize: data.companySize || null,
          website: data.website || null,
          logoUrl: data.logoUrl || null,
          description: data.description || null,
          locationCity: data.locationCity || null,
          locationState: data.locationState || null,
          locationCountry: data.locationCountry || "USA",
        },
      });

      // Mark onboarding as completed
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          userType: "BUSINESS",
          onboardingCompleted: true,
          name: data.companyName,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Business onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

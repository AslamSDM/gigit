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

    // Use a transaction to update all related data
    await prisma.$transaction(async (tx) => {
      // Update or create worker profile
      const workerProfile = await tx.workerProfile.upsert({
        where: { userId: session.user.id },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          headline: data.headline,
          bio: data.bio,
          resumeUrl: data.resumeUrl,
          linkedinUrl: data.linkedinUrl,
          locationCity: data.locationCity,
          locationState: data.locationState,
          locationCountry: data.locationCountry,
          locationZipCode: data.locationZipCode,
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
          dailyRate: data.dailyRate ? parseFloat(data.dailyRate) : null,
          yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : null,
          willingToRelocate: data.willingToRelocate || false,
          willingToTravel: data.willingToTravel || false,
        },
        create: {
          userId: session.user.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone,
          headline: data.headline,
          bio: data.bio,
          resumeUrl: data.resumeUrl,
          linkedinUrl: data.linkedinUrl,
          locationCity: data.locationCity,
          locationState: data.locationState,
          locationCountry: data.locationCountry,
          locationZipCode: data.locationZipCode,
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
          dailyRate: data.dailyRate ? parseFloat(data.dailyRate) : null,
          yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : null,
          willingToRelocate: data.willingToRelocate || false,
          willingToTravel: data.willingToTravel || false,
        },
      });

      // Update skills
      if (data.skills && data.skills.length > 0) {
        // Delete existing skills
        await tx.workerSkill.deleteMany({
          where: { workerId: workerProfile.id },
        });

        // Add new skills
        await tx.workerSkill.createMany({
          data: data.skills.map((skill: any) => ({
            workerId: workerProfile.id,
            skillId: skill.skillId,
            proficiencyLevel: skill.proficiencyLevel,
            yearsOfExperience: skill.yearsOfExperience,
          })),
        });
      }

      // Update work experiences
      if (data.workExperiences) {
        // Delete existing experiences
        await tx.workExperience.deleteMany({
          where: { workerId: workerProfile.id },
        });

        // Add new experiences
        if (data.workExperiences.length > 0) {
          await tx.workExperience.createMany({
            data: data.workExperiences.map((exp: any) => ({
              workerId: workerProfile.id,
              title: exp.title,
              company: exp.company,
              location: exp.location,
              startDate: new Date(exp.startDate + "-01"),
              endDate: exp.endDate ? new Date(exp.endDate + "-01") : null,
              isCurrent: exp.isCurrent,
              description: exp.description,
            })),
          });
        }
      }

      // Update languages
      if (data.languages) {
        // Delete existing languages
        await tx.workerLanguage.deleteMany({
          where: { workerId: workerProfile.id },
        });

        // Add new languages
        if (data.languages.length > 0) {
          // First, ensure languages exist in the Language table
          for (const lang of data.languages) {
            await tx.language.upsert({
              where: { id: lang.languageId },
              update: {},
              create: {
                id: lang.languageId,
                name: lang.name,
                code: lang.languageId,
              },
            });
          }

          await tx.workerLanguage.createMany({
            data: data.languages.map((lang: any) => ({
              workerId: workerProfile.id,
              languageId: lang.languageId,
              proficiency: lang.proficiency,
            })),
          });
        }
      }

      // Update licenses
      if (data.licenses) {
        // Delete existing licenses
        await tx.license.deleteMany({
          where: { workerId: workerProfile.id },
        });

        // Add new licenses
        if (data.licenses.length > 0) {
          await tx.license.createMany({
            data: data.licenses.map((lic: any) => ({
              workerId: workerProfile.id,
              name: lic.name,
              issuingAuthority: lic.issuingAuthority,
              licenseNumber: lic.licenseNumber || null,
              issueDate: lic.issueDate ? new Date(lic.issueDate) : null,
              expiryDate: lic.expiryDate ? new Date(lic.expiryDate) : null,
              state: lic.state || null,
              documentUrl: lic.documentUrl || null,
            })),
          });
        }
      }

      // Mark onboarding as completed
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          userType: "WORKER",
          onboardingCompleted: true,
          name: `${data.firstName} ${data.lastName}`.trim(),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

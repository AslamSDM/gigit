import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus, ContractType } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const data = await request.json();

    // Get application with job and business info
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobPost: {
          include: { business: true },
        },
        worker: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (application.jobPost.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newStatus = data.status as ApplicationStatus;

    // Update application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
      },
    });

    // Create notification for worker
    let notificationType: string;
    let notificationTitle: string;
    let notificationMessage: string;

    switch (newStatus) {
      case "SHORTLISTED":
        notificationType = "JOB_APPLICATION";
        notificationTitle = "Application Shortlisted";
        notificationMessage = `Great news! Your application for ${application.jobPost.title} has been shortlisted by ${application.jobPost.business.companyName}.`;
        break;
      case "ACCEPTED":
        notificationType = "JOB_ACCEPTED";
        notificationTitle = "Application Accepted";
        notificationMessage = `Congratulations! Your application for ${application.jobPost.title} has been accepted by ${application.jobPost.business.companyName}.`;

        // Create a contract when application is accepted
        await prisma.contract.create({
          data: {
            jobPostId: application.jobPostId,
            workerId: application.workerId,
            businessId: application.jobPost.businessId,
            contractType: application.jobPost.jobType === "BULK" ? ContractType.BULK_MEMBER : ContractType.INDIVIDUAL,
            startDate: application.jobPost.startDate || new Date(),
            endDate: application.jobPost.endDate,
            agreedRate: application.proposedRate || application.jobPost.budgetMin || 0,
          },
        });
        break;
      case "REJECTED":
        notificationType = "JOB_REJECTED";
        notificationTitle = "Application Update";
        notificationMessage = `Your application for ${application.jobPost.title} at ${application.jobPost.business.companyName} was not selected at this time.`;
        break;
      default:
        notificationType = "JOB_APPLICATION";
        notificationTitle = "Application Update";
        notificationMessage = `Your application for ${application.jobPost.title} has been updated.`;
    }

    await prisma.notification.create({
      data: {
        userId: application.worker.userId,
        type: notificationType as any,
        title: notificationTitle,
        message: notificationMessage,
        link: `/applications`,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

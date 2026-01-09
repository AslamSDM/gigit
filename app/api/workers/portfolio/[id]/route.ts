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
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    const portfolioItem = await prisma.portfolioItem.findFirst({
      where: {
        id,
        workerId: workerProfile.id,
      },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolioItem);
  } catch (error) {
    console.error("Failed to fetch portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio item" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    const portfolioItem = await prisma.portfolioItem.findFirst({
      where: {
        id,
        workerId: workerProfile.id,
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Delete existing images to replace with new ones
    await prisma.portfolioImage.deleteMany({
      where: { portfolioItemId: id },
    });

    const updatedItem = await prisma.portfolioItem.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        projectDate: new Date(data.projectDate),
        images: {
          create: data.images?.map((img: { url: string }, index: number) => ({
            imageUrl: img.url,
            displayOrder: index,
          })) || [],
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Failed to update portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
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

    const { id } = await params;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    const portfolioItem = await prisma.portfolioItem.findFirst({
      where: {
        id,
        workerId: workerProfile.id,
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    await prisma.portfolioItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}

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
      select: { id: true },
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker profile not found" },
        { status: 404 }
      );
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: { workerId: workerProfile.id },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { projectDate: "desc" },
    });

    return NextResponse.json(portfolioItems);
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
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

    const data = await request.json();

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        workerId: workerProfile.id,
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

    return NextResponse.json(portfolioItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}

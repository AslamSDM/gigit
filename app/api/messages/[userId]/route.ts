import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Find conversation between the two users
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: userId } } },
        ],
      },
    });

    if (!conversation) {
      // No conversation exists yet, return empty
      const otherUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          userType: true,
          workerProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              headline: true,
            },
          },
          businessProfile: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      });

      return NextResponse.json({
        messages: [],
        otherUser,
      });
    }

    // Get messages from the conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { sentAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Get other user details
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        userType: true,
        workerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
          },
        },
        businessProfile: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    // Map messages to expected format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.sentAt,
      isRead: msg.isRead,
      senderId: msg.senderId,
      sender: msg.sender,
    }));

    return NextResponse.json({
      messages: formattedMessages,
      otherUser,
    });
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

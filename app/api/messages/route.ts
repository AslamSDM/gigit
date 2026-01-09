import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                userType: true,
              },
            },
          },
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format conversations for the response
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== session.user.id
      );
      const lastMessage = conv.messages[0];

      // Count unread messages
      const unreadCount = conv.messages.filter(
        (m) => m.senderId !== session.user.id && !m.isRead
      ).length;

      return {
        id: conv.id,
        otherUser: otherParticipant?.user || null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.sentAt,
              isRead: lastMessage.isRead,
              senderId: lastMessage.senderId,
            }
          : null,
        unreadCount,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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

    const data = await request.json();
    const { receiverId, content } = data;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    // Determine the actual receiver user ID
    let actualReceiverId = receiverId;

    // Check if it's a user ID first
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      // Maybe it's a worker profile ID, find the user
      const workerProfile = await prisma.workerProfile.findUnique({
        where: { id: receiverId },
        select: { userId: true },
      });

      if (!workerProfile) {
        return NextResponse.json(
          { error: "Receiver not found" },
          { status: 404 }
        );
      }

      actualReceiverId = workerProfile.userId;
    }

    // Find or create conversation between the two users
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: actualReceiverId } } },
        ],
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: session.user.id },
              { userId: actualReceiverId },
            ],
          },
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content,
      },
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

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: actualReceiverId,
        type: "MESSAGE",
        title: "New Message",
        message: `You have a new message from ${session.user.name || session.user.email}`,
        link: "/messages",
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

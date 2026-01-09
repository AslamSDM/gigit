"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  ArrowLeft,
  Circle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    userType: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface OtherUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  userType: string | null;
  workerProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    headline: string | null;
  } | null;
  businessProfile?: {
    id: string;
    companyName: string;
  } | null;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setOtherUser(data.otherUser);

        // Update unread count in conversations
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === userId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");

        // Update last message in conversations
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  lastMessage: {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    isRead: false,
                    senderId: message.senderId,
                  },
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.otherUser.name || conv.otherUser.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getDisplayName = (user: OtherUser | Conversation["otherUser"]) => {
    if ("workerProfile" in user && user.workerProfile) {
      return `${user.workerProfile.firstName} ${user.workerProfile.lastName}`;
    }
    if ("businessProfile" in user && user.businessProfile) {
      return user.businessProfile.companyName;
    }
    return user.name || user.email;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with employers and workers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className={cn("md:col-span-1", selectedConversation && "hidden md:block")}>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {filteredConversations.length > 0 ? (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left",
                        selectedConversation === conv.id && "bg-muted"
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={conv.otherUser.image || undefined} />
                        <AvatarFallback>
                          {getInitials(getDisplayName(conv.otherUser))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {getDisplayName(conv.otherUser)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                              addSuffix: false,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {searchQuery
                      ? "No conversations found"
                      : "No messages yet"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className={cn("md:col-span-2", !selectedConversation && "hidden md:flex md:flex-col")}>
          {selectedConversation && otherUser ? (
            <>
              <CardHeader className="border-b py-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={otherUser.image || undefined} />
                    <AvatarFallback>
                      {getInitials(getDisplayName(otherUser))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getDisplayName(otherUser)}</p>
                    {otherUser.workerProfile?.headline && (
                      <p className="text-sm text-muted-foreground">
                        {otherUser.workerProfile.headline}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col h-[calc(100vh-400px)]">
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender.id !== selectedConversation;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-2",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            {!isOwn && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.sender.image || undefined} />
                                <AvatarFallback>
                                  {getInitials(msg.sender.name || "U")}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-4 py-2",
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  isOwn
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatDistanceToNow(new Date(msg.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                </ScrollArea>
                <form
                  onSubmit={handleSendMessage}
                  className="border-t p-4 flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

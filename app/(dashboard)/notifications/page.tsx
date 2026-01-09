"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  MoreVertical,
  Trash2,
  Briefcase,
  FileText,
  MessageSquare,
  AlertCircle,
  Info,
  Star,
  Calendar,
  Circle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const notificationIcons: Record<string, React.ReactNode> = {
  JOB_APPLICATION: <FileText className="h-5 w-5 text-purple-500" />,
  JOB_ACCEPTED: <Briefcase className="h-5 w-5 text-green-500" />,
  JOB_REJECTED: <AlertCircle className="h-5 w-5 text-red-500" />,
  PAYMENT_RECEIVED: <Star className="h-5 w-5 text-green-500" />,
  PAYMENT_SENT: <Star className="h-5 w-5 text-blue-500" />,
  MESSAGE: <MessageSquare className="h-5 w-5 text-green-500" />,
  REVIEW_RECEIVED: <Star className="h-5 w-5 text-yellow-500" />,
  CONTRACT_CREATED: <Calendar className="h-5 w-5 text-indigo-500" />,
  CONTRACT_COMPLETED: <Calendar className="h-5 w-5 text-green-500" />,
  WORKER_HIRED: <Briefcase className="h-5 w-5 text-blue-500" />,
  SYSTEM: <Info className="h-5 w-5 text-gray-500" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page, showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(showUnreadOnly && { unread: "true" }),
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = data?.notifications.filter((n) => !n.isRead).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowUnreadOnly(!showUnreadOnly);
              setPage(1);
            }}
          >
            {showUnreadOnly ? "Show All" : "Unread Only"}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {data && data.notifications.length > 0 ? (
            <div className="divide-y">
              {data.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-2 bg-muted rounded-full">
                    {notificationIcons[notification.type] || (
                      <Bell className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Circle className="h-2 w-2 fill-primary text-primary" />
                        )}
                        <h4 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                          {notification.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.isRead ? (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkRead(notification.id);
                                }}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Read
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground">
                {showUnreadOnly
                  ? "You have no unread notifications"
                  : "You're all caught up!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

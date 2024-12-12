'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
}

export default function NotificationsDropdown({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  // Refresh notifications when dropdown opens
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center">
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer ${!notification.isRead ? 'bg-gray-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{notification.message}</p>
                  <span className="text-xs text-gray-500">
                    {isNaN(new Date(notification.createdAt).getTime())
                      ? 'Invalid date'
                      : formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from '@/app/contexts/NotificationsContext';
import { useSession } from 'next-auth/react';
import NotificationItem from './NotificationItem';
import { Loader2 } from "lucide-react";
import { UserNotification, AdminNotification } from '@/app/types/notifications';

export default function UserNotifications() {
  const { data: session, status: sessionStatus } = useSession();
  const { notifications, markAsRead } = useNotifications();
  
  // Type guard to check if a notification is a UserNotification
  const isUserNotification = (notification: UserNotification | AdminNotification): notification is UserNotification => {
    return (notification as UserNotification).userId !== undefined;
  };

  // Show loading state while session is loading
  if (sessionStatus === 'loading') {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ScrollArea className="h-[400px] w-full rounded-md border">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {notifications
              .filter(isUserNotification)
              .filter((notification) => notification.userId === session?.user?.id)
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 
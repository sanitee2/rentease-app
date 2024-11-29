'use client';

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SafeUser } from "@/app/types";
import UserNotifications from "./UserNotifications";
import AdminNotifications from "./AdminNotifications";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import { useEffect } from "react";

interface NotificationsDropdownProps {
  currentUser?: SafeUser | null;
}

export default function NotificationsDropdown({ 
  currentUser 
}: NotificationsDropdownProps) {
  const { notifications, unreadCount, fetchNotifications } = useNotifications();

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
    }
  }, [currentUser?.id, fetchNotifications]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
      >
        {currentUser?.role === 'ADMIN' ? (
          <AdminNotifications />
        ) : (
          <UserNotifications />
        )}
      </PopoverContent>
    </Popover>
  );
} 
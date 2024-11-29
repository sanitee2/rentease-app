'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from '@/app/hooks/useSocket';
import { useNotifications } from '@/app/contexts/NotificationsContext';
import { useSession } from 'next-auth/react';
import NotificationItem from './NotificationItem';
import { 
  AdminNewListingData, 
  AdminNotification, 
  NotificationType,
  NotificationStatus 
} from '@/app/types/notifications';
import TestNotificationButton from '../TestNotificationButton';
import { Loader2 } from "lucide-react";

export default function AdminNotifications() {
  const { data: session, status: sessionStatus } = useSession();
  const { notifications, addNotification, markAsRead } = useNotifications();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const socket = useSocket({
    userId: session?.user?.id || '',
    role: 'ADMIN',
    onConnect: () => {
      setIsConnecting(false);
      setError(null);
    },
    onError: (err) => {
      setError('Failed to connect to notification service');
      setIsConnecting(false);
    }
  });

  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const handleNewListing = (data: AdminNewListingData) => {
      try {
        console.log('[AdminNotifications] Received notification data:', data);
        
        if (!data || !data.listingId) {
          throw new Error('Invalid notification data received');
        }

        const notification: Omit<AdminNotification, 'id'> = {
          type: NotificationType.NEW_LISTING,
          title: 'New Listing Submitted',
          message: data.message || 'A new property listing requires review',
          status: NotificationStatus.INFO,
          isRead: false,
          listingId: data.listingId,
          landlordId: data.landlordId,
          userId: session?.user?.id!,
          createdAt: new Date().toISOString(),
        };
        
        console.log('[AdminNotifications] Created notification object:', notification);
        addNotification(notification);
      } catch (error) {
        console.error('[AdminNotifications] Error handling notification:', error);
        setError('Failed to process notification');
      }
    };

    // Set up event listeners
    socket.on('connect', () => {
      console.log('[AdminNotifications] Socket connected');
      setIsConnecting(false);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('[AdminNotifications] Socket connection error:', err);
      setError('Connection error');
      setIsConnecting(false);
    });

    socket.on('admin:new_listing', handleNewListing);

    // Cleanup function
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('admin:new_listing', handleNewListing);
    };
  }, [socket, session?.user?.id, addNotification]);

  // Show loading state while session is loading
  if (sessionStatus === 'loading' || isConnecting) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-destructive text-center">
          <p>{error}</p>
          <button 
            onClick={() => socket?.connect()} 
            className="text-sm text-muted-foreground hover:text-foreground mt-2"
          >
            Try reconnecting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <TestNotificationButton />
      </div>
      
      <ScrollArea className="h-[400px] w-full rounded-md border">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {notifications.map((notification: AdminNotification) => (
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
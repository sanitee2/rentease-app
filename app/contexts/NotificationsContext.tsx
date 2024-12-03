'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SafeUser } from '@/app/types';

export interface Notification {
  id: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ 
  children,
  currentUser 
}: { 
  children: React.ReactNode;
  currentUser?: SafeUser | null;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Initialize SSE connection
    const eventSource = new EventSource(`/api/notifications/stream?userId=${currentUser.id}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE message received:', data);
      
      if (data.type === 'NOTIFICATIONS') {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      } else if (data.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      eventSource.close();
    };
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 
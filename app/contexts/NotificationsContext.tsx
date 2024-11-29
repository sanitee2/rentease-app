'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AdminNotification } from '@/app/types/notifications';

interface NotificationsContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AdminNotification, 'id'>) => void;
  markAsRead: (id: string) => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const { data: session } = useSession();

  // Load initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      console.log('[NotificationsContext] Loaded notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('[NotificationsContext] Error loading notifications:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback(async (newNotification: Omit<AdminNotification, 'id'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });

      if (!response.ok) throw new Error('Failed to save notification');
      
      const savedNotification = await response.json();
      console.log('[NotificationsContext] Saved notification:', savedNotification);
      
      setNotifications(prev => [savedNotification, ...prev]);
    } catch (error) {
      console.error('[NotificationsContext] Error saving notification:', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/mark-read`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('[NotificationsContext] Error marking notification as read:', error);
    }
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount: 0, addNotification, markAsRead, fetchNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
} 
'use client';

import { NotificationsProvider as BaseNotificationsProvider } from '@/app/contexts/NotificationsContext';

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  return <BaseNotificationsProvider>{children}</BaseNotificationsProvider>;
} 
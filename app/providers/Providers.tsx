'use client';

import { SessionProvider } from 'next-auth/react';
import ToasterProvider from './ToasterProviders';
import SessionExpiryProvider from '../components/SessionExpiryProvider';
import RegisterModal from '../components/Modals/RegisterModal';
import LoginModal from '../components/Modals/LoginModal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import SessionExpiredModal from '../components/Modals/SessionExpiredModal';
import { NotificationsProvider } from '../contexts/NotificationsContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
        <NotificationsProvider>
        <ToasterProvider />
        <RegisterModal />
        <LoginModal />
        <ConfirmModal />
        <SessionExpiredModal />
        <SessionExpiryProvider>
          {children}
        </SessionExpiryProvider>
        </NotificationsProvider>
    </SessionProvider>
  );
} 
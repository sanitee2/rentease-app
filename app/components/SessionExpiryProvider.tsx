'use client';

import { SessionProvider } from "next-auth/react";
import { useSessionExpiry } from "@/app/hooks/useSessionExpiry";

function SessionExpiryWrapper() {
  useSessionExpiry();
  return null;
}

export default function SessionExpiryProvider({ children }: { children?: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionExpiryWrapper />
      {children}
    </SessionProvider>
  );
} 
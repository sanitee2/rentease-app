'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useMemo } from 'react';

export const useSessionExpiry = () => {
  const { data: session, update } = useSession();
  const lastActivityRef = useRef(Date.now());
  const ONE_HOUR_MS = useMemo(() => 60 * 60 * 1000, []); // 1 hour in milliseconds

  useEffect(() => {
    // Track user activity
    const updateLastActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add listeners for user activity
    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);
    window.addEventListener('touchstart', updateLastActivity);

    // Check session and activity status every 5 minutes
    const checkInterval = setInterval(async () => {
      if (session) {
        const inactiveTime = Date.now() - lastActivityRef.current;
        
        try {
          const response = await fetch('/api/auth/session');
          const data = await response.json();
          
          // Check if session is expired or user has been inactive for 1 hour
          if (!data || 
              Date.now() >= new Date(data.expires).getTime() || 
              inactiveTime >= ONE_HOUR_MS) {
            console.log('Session expired or user inactive:', {
              inactiveTime,
              threshold: ONE_HOUR_MS
            });
            await signOut({ redirect: true });
            return;
          }
          
          // Only update session if user has been active
          if (inactiveTime < ONE_HOUR_MS) {
            await update();
          }
        } catch (error) {
          console.error('Session check failed:', error);
          await signOut({ redirect: true });
        }
      }
    }, 300000); // Check every 5 minutes instead of 5 seconds

    return () => {
      // Cleanup
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
      window.removeEventListener('touchstart', updateLastActivity);
      clearInterval(checkInterval);
    };
  }, [session, update, ONE_HOUR_MS]);
}; 
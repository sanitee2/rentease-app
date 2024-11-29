'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../types/socket';

interface UseSocketProps {
  userId: string;
  role?: string;
  onConnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket({ 
  userId, 
  role,
  onConnect,
  onError
}: UseSocketProps) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    if (!userId) return;

    if (!socketRef.current) {
      try {
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          path: process.env.NEXT_PUBLIC_SOCKET_PATH,
          auth: { userId, role },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
          console.log('[Socket] Connected with ID:', socketRef.current?.id);
          onConnect?.();
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('[Socket] Connection error:', error);
          onError?.(error);
        });

        if (role === 'ADMIN') {
          socketRef.current.emit('join:admin');
        }
      } catch (error) {
        console.error('[Socket] Initialization error:', error);
        onError?.(error as Error);
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, role, onConnect, onError]);

  return socketRef.current;
} 
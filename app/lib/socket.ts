import { io as socketIOClient, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../types/socket';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function initSocket() {
  if (!socket) {
    try {
      socket = socketIOClient(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        path: process.env.NEXT_PUBLIC_SOCKET_PATH,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket?.id);
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });
    } catch (error) {
      console.error('[Socket] Initialization error:', error);
      return null;
    }
  }
  return socket;
}

export function getSocket() {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

// Export the socket instance as well
export { socket }; 
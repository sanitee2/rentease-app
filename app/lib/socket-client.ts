import { io } from 'socket.io-client';
import { SocketClient } from '../types/socket';


let socket: SocketClient | null = null;

export const getClientSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/api/socket',
      autoConnect: true,
    });
  }
  return socket;
};

export type { SocketClient }; 
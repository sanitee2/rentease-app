import { Socket as ClientSocketIO } from 'socket.io-client';
import { Socket as ServerSocketIO } from 'socket.io';
import { AdminNewListingData } from './notifications';

export interface ServerToClientEvents {
  'admin:new_listing': (data: AdminNewListingData) => void;
  'notification:received': (data: any) => void;
  'connect': () => void;
  'connect_error': (error: Error) => void;
  'disconnect': () => void;
}

export interface ClientToServerEvents {
  'join:room': (room: string) => void;
  'leave:room': (room: string) => void;
  'join:admin': () => void;
  'leave:admin': () => void;
  'admin:new_listing': (data: AdminNewListingData) => void;
  'notification:send': (data: any) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  role?: string;
}

export type SocketClient = ClientSocketIO<ServerToClientEvents, ClientToServerEvents>;
export type SocketServer = ServerSocketIO<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>; 
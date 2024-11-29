import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData 
} from '../app/types/socket';

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function initSocketServer(httpServer?: HttpServer) {
  if (!io) {
    const server = httpServer || createServer();
    
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
      server,
      {
        path: process.env.NEXT_PUBLIC_SOCKET_PATH,
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL,
          methods: ['GET', 'POST']
        }
      }
    );

    io.on('connection', (socket) => {
      console.log('[Socket] Client connected:', socket.id);

      socket.on('join:admin', () => {
        socket.join('admin-room');
        console.log(`[Socket] Client ${socket.id} joined admin room`);
      });

      socket.on('leave:admin', () => {
        socket.leave('admin-room');
        console.log(`[Socket] Client ${socket.id} left admin room`);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Client disconnected:', socket.id);
      });
    });

    if (!httpServer) {
      const PORT = process.env.SOCKET_PORT || 3001;
      server.listen(PORT, () => {
        console.log(`[Socket] Server running on port ${PORT}`);
      });
    }
  }
  return io;
}

export function getSocketServer() {
  if (!io) {
    return initSocketServer();
  }
  return io;
}

export { io }; 
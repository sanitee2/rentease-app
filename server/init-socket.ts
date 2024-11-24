import { createServer } from 'http';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  path: '/api/socket',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  connectTimeout: 60000,
  transports: ['websocket', 'polling']
});

const PORT = process.env.SOCKET_PORT || 3001;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('listing-status-update', async (data) => {
    try {
      console.log('Received status update:', data);
      io.emit('listing-status-changed', {
        listingId: data.listingId,
        newStatus: data.newStatus
      });
    } catch (error) {
      console.error('Error handling status update:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

export { io };
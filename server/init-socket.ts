import { createServer } from 'http';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { initSocketServer } from './socket-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const io = initSocketServer();

// Keep the server running
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing socket server...');
  io?.close(() => {
    console.log('Socket server closed');
    process.exit(0);
  });
});

export { io };
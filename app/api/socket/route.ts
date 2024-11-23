import { createServer } from 'http';
import { initSocketServer } from '@/app/lib/socket';

const httpServer = createServer();
const io = initSocketServer(httpServer);

export async function GET() {
  return new Response('Socket initialized');
} 
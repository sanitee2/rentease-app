import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  console.log('SSE Connection attempt for userId:', userId);

  if (!userId) {
    console.log('SSE Connection rejected: No userId provided');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let heartbeatInterval: NodeJS.Timeout;

  const customReadable = new ReadableStream({
    async start(controller) {
      console.log('SSE Stream started for userId:', userId);

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ 
          type: 'CONNECTED', 
          message: `Connected to notifications for user ${userId}` 
        })}\n\n`)
      );

      try {
        const notifications = await prisma.notification.findMany({
          where: {
            userId,
            isRead: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log('Initial notifications fetched:', notifications.length);

        if (notifications.length > 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'NOTIFICATIONS', 
              notifications 
            })}\n\n`)
          );
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }

      // Keep connection alive with heartbeat
      heartbeatInterval = setInterval(() => {
        try {
          if (controller.desiredSize !== null) {
            console.log('Sending heartbeat to userId:', userId);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'HEARTBEAT' })}\n\n`)
            );
          }
        } catch (error) {
          console.error('Heartbeat error:', error);
          clearInterval(heartbeatInterval);
        }
      }, 10000);
    },
    cancel() {
      console.log('SSE Stream cancelled for userId:', userId);
      clearInterval(heartbeatInterval);
    }
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
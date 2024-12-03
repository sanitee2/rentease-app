import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { NotificationType, NotificationStatus } from '@prisma/client';

// Type for notification templates
interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
}

// Notification templates
const templates = {
  newTenant: (listingTitle: string): NotificationTemplate => ({
    type: 'NEW_LISTING',
    title: 'New Tenant Added',
    message: `You have been added as a tenant for ${listingTitle}`,
    status: 'INFO'
  }),
  leaseCancelled: (listingTitle: string): NotificationTemplate => ({
    type: 'NEW_LISTING',
    title: 'Lease Cancelled',
    message: `Your lease for ${listingTitle} has been cancelled`,
    status: 'WARNING'
  }),
  // Add other templates as needed
};

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, listingId } = body;

    // Get the listing title if listingId is provided
    let listingTitle = 'the listing';
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { title: true }
      });
      if (listing) {
        listingTitle = listing.title;
      }
    }

    // Get template based on notification type
    const template = type === 'leaseCancelled' 
      ? templates.leaseCancelled(listingTitle)
      : templates.newTenant(listingTitle);

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: template.type,
        title: template.title,
        message: template.message,
        status: template.status,
        listingId,
      },
    });

    // Emit the new notification event
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'NEW_NOTIFICATION', 
            notification 
          })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
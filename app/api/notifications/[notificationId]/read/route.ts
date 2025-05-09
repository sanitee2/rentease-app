import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const { notificationId } = params;

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the specific notification
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[NOTIFICATION_READ]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
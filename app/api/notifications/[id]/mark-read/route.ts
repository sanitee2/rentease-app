import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[PATCH /api/notifications/mark-read]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import  getCurrentUser  from '@/app/actions/getCurrentUser';
import { NotificationType, NotificationStatus } from '@/app/types/notifications';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const notification = await prisma.notification.create({
      data: {
        ...body,
        userId: currentUser.id,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[POST /api/notifications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
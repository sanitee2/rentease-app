import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        listing: {
          userId: currentUser.id
        },
        status: 'PENDING'
      },
      select: {
        id: true,
        description: true,
        createdAt: true,
        status: true,
        listing: {
          select: {
            id: true,
            title: true,
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json(requests);
    
  } catch (error) {
    console.error('[MAINTENANCE_REQUESTS]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const recentLeases = await prisma.leaseContract.findMany({
      where: {
        listing: { userId: currentUser.id },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json(recentLeases);
  } catch (error) {
    console.error('[RECENT_LEASES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
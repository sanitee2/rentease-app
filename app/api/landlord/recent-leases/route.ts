import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recentLeases = await prisma.leaseContract.findMany({
      where: {
        listing: {
          userId: currentUser.id
        }
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 5
    });

    const formattedLeases = recentLeases.map(lease => ({
      id: lease.id,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount,
      tenant: {
        firstName: lease.user.firstName,
        lastName: lease.user.lastName
      },
      listing: lease.listing
    }));

    return NextResponse.json(formattedLeases);
    
  } catch (error) {
    console.error('[RECENT_LEASES]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 
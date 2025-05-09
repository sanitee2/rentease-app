import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get last 6 months of data
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        start: startOfMonth(date),
        month: format(date, 'MMM yyyy')
      };
    }).reverse();

    const occupancyData = await Promise.all(
      months.map(async ({ start, month }) => {
        const totalRooms = await prisma.room.count({
          where: {
            listing: { userId: currentUser.id },
            createdAt: { lte: start }
          }
        });

        const occupiedRooms = await prisma.room.count({
          where: {
            listing: { userId: currentUser.id },
            createdAt: { lte: start },
            currentTenants: { isEmpty: false }
          }
        });

        const occupancyRate = totalRooms > 0 
          ? Math.round((occupiedRooms / totalRooms) * 100)
          : 0;

        return {
          month,
          occupancyRate
        };
      })
    );

    return NextResponse.json(occupancyData);
  } catch (error) {
    console.error('[OCCUPANCY_TRENDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
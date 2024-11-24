import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 6 months of data
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        startDate: startOfMonth(date),
        month: format(date, 'MMM yyyy')
      };
    }).reverse();

    // Get occupancy data for each month
    const occupancyData = await Promise.all(
      months.map(async ({ startDate, month }) => {
        const listings = await prisma.listing.findMany({
          where: {
            userId: currentUser.id
          },
          include: {
            rooms: true,
            leaseContracts: {
              where: {
                startDate: {
                  lte: startDate
                },
                endDate: {
                  gte: startDate
                }
              }
            }
          }
        });

        const totalRooms = listings.reduce((acc, listing) => 
          acc + listing.rooms.length, 0);
        const occupiedRooms = listings.reduce((acc, listing) => 
          acc + listing.rooms.filter(room => 
            room.currentTenants.length > 0
          ).length, 0);

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
    console.error('[OCCUPANCY_TRENDS]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 
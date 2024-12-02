import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

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
        end: endOfMonth(date),
        month: format(date, 'MMM yyyy')
      };
    }).reverse();

    const trendsData = await Promise.all(
      months.map(async ({ start, end, month }) => {
        // Get all listings for this landlord
        const listings = await prisma.listing.findMany({
          where: { userId: currentUser.id },
          select: { 
            id: true,
            rooms: {
              select: {
                id: true,
                currentTenants: true
              }
            }
          }
        });

        // Calculate rooms and occupancy
        const totalRooms = listings.reduce((sum, listing) => 
          sum + listing.rooms.length, 0);
        
        const occupiedRooms = listings.reduce((sum, listing) => 
          sum + listing.rooms.filter(room => 
            room.currentTenants.length > 0
          ).length, 0);

        // Get active leases for this month
        const activeLeases = await prisma.leaseContract.count({
          where: {
            listing: { userId: currentUser.id },
            status: 'ACTIVE',
            AND: [
              { startDate: { lte: end } },
              {
                OR: [
                  { endDate: null },
                  { endDate: { gte: start } }
                ]
              }
            ]
          }
        });

        // Calculate monthly revenue from completed payments
        const monthlyPayments = await prisma.payment.aggregate({
          where: {
            lease: {
              listing: { userId: currentUser.id }
            },
            status: 'COMPLETED',
            createdAt: {
              gte: start,
              lte: end
            }
          },
          _sum: {
            amount: true
          }
        });

        const occupancyRate = totalRooms > 0 
          ? Math.round((occupiedRooms / totalRooms) * 100)
          : 0;

        return {
          month,
          revenue: monthlyPayments._sum.amount || 0,
          occupancyRate,
          activeLeases,
          // Debug info
          _debug: {
            totalRooms,
            occupiedRooms,
            monthRange: `${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`
          }
        };
      })
    );

    console.log('Trends Data:', JSON.stringify(trendsData, null, 2));

    return NextResponse.json(trendsData);
  } catch (error) {
    console.error('[DASHBOARD_TRENDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
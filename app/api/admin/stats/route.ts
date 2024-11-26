import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get current date and date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Get total landlords and growth
    const [totalLandlords, previousMonthLandlords] = await Promise.all([
      prisma.user.count({
        where: { role: 'LANDLORD' }
      }),
      prisma.user.count({
        where: {
          role: 'LANDLORD',
          createdAt: { lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get listings stats
    const [activeListings, previousMonthListings, pendingListings] = await Promise.all([
      prisma.listing.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.listing.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lt: thirtyDaysAgo }
        }
      }),
      prisma.listing.count({
        where: { status: 'PENDING' }
      })
    ]);

    // Calculate growth percentages
    const landlordGrowth = previousMonthLandlords > 0
      ? `+${(((totalLandlords - previousMonthLandlords) / previousMonthLandlords) * 100).toFixed(1)}% this month`
      : '+0% this month';

    const listingGrowth = previousMonthListings > 0
      ? `+${(((activeListings - previousMonthListings) / previousMonthListings) * 100).toFixed(1)}% this month`
      : '+0% this month';

    return NextResponse.json({
      totalLandlords,
      activeListings,
      pendingListings,
      landlordGrowth,
      listingGrowth
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
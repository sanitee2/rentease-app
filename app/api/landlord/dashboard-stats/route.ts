import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get total listings
    const totalListings = await prisma.listing.count({
      where: { userId: currentUser.id }
    });

    // Get active leases
    const activeLeases = await prisma.leaseContract.count({
      where: {
        listing: { userId: currentUser.id },
        status: 'ACTIVE'
      }
    });

    // Calculate total revenue from active leases
    const leases = await prisma.leaseContract.findMany({
      where: {
        listing: { userId: currentUser.id },
        status: 'ACTIVE'
      },
      select: { rentAmount: true }
    });
    const totalRevenue = leases.reduce((sum, lease) => sum + lease.rentAmount, 0);

    // Get pending maintenance requests
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        listing: { userId: currentUser.id },
        status: 'PENDING'
      }
    });

    // Calculate occupancy rate
    const totalRooms = await prisma.room.count({
      where: {
        listing: { userId: currentUser.id }
      }
    });

    const occupiedRooms = await prisma.room.count({
      where: {
        listing: { userId: currentUser.id },
        currentTenants: { isEmpty: false }
      }
    });

    const occupancyRate = totalRooms > 0 
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    return NextResponse.json({
      totalListings,
      activeLeases,
      totalRevenue,
      pendingMaintenance,
      occupancyRate
    });
  } catch (error) {
    console.error('[DASHBOARD_STATS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
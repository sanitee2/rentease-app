import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId: currentUser.id
      },
      include: {
        rooms: true,
        leaseContracts: {
          where: {
            isActive: true
          },
          select: {
            rentAmount: true
          }
        },
        maintenanceRequests: {
          where: {
            status: "PENDING"
          }
        }
      }
    });

    // Calculate stats
    const totalListings = listings.length;
    
    // Calculate active leases
    const activeLeases = listings.reduce((sum, listing) => 
      sum + listing.leaseContracts.length, 0);
    
    // Calculate total revenue from active leases with null check
    const totalRevenue = listings.reduce((sum, listing) => {
      return sum + listing.leaseContracts.reduce((leaseSum, lease) => 
        leaseSum + (lease.rentAmount ?? 0), 0);
    }, 0);

    // Count pending maintenance requests
    const pendingMaintenance = listings.reduce((sum, listing) => 
      sum + listing.maintenanceRequests.length, 0);

    // Calculate occupancy rate
    const totalRooms = listings.reduce((sum, listing) => 
      sum + listing.rooms.length, 0);
    const occupiedRooms = listings.reduce((sum, listing) => 
      sum + listing.leaseContracts.length, 0);
    const occupancyRate = totalRooms > 0 
      ? Math.round((occupiedRooms / totalRooms) * 100) 
      : 0;

    // Return the stats
    return NextResponse.json({
      totalListings,
      activeLeases,
      totalRevenue,
      pendingMaintenance,
      occupancyRate
    });

  } catch (error) {
    console.error("[DASHBOARD_STATS]", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 
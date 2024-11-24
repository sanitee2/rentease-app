import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total listings
    const listings = await prisma.listing.findMany({
      where: { userId: currentUser.id },
      include: {
        rooms: true,
        leaseContracts: {
          where: {
            endDate: { gt: new Date() } // Only active leases
          }
        },
        maintenanceRequests: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    // Calculate statistics
    const totalListings = listings.length;
    
    // Count active leases
    const activeLeases = listings.reduce((acc, listing) => 
      acc + listing.leaseContracts.length, 0);

    // Calculate total revenue from active leases
    const totalRevenue = listings.reduce((acc, listing) => 
      acc + listing.leaseContracts.reduce((sum, lease) => 
        sum + lease.rentAmount, 0), 0);

    // Count pending maintenance requests
    const pendingMaintenance = listings.reduce((acc, listing) => 
      acc + listing.maintenanceRequests.length, 0);

    // Calculate occupancy rate
    const totalRooms = listings.reduce((acc, listing) => 
      acc + listing.rooms.length, 0);
    const occupiedRooms = listings.reduce((acc, listing) => 
      acc + listing.rooms.filter(room => room.currentTenants.length > 0).length, 0);
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
    console.error('[DASHBOARD_STATS]', error);
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500 }
    );
  }
} 
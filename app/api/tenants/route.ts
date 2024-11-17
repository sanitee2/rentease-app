// File: app/api/tenants/route.ts

import { NextRequest, NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getTenants from '@/app/actions/getTenants';
import prisma from '@/app/libs/prismadb';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Verify user is a landlord
    if (currentUser.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: "Unauthorized access" }, 
        { status: 403 }
      );
    }

    const tenants = await getTenants(currentUser.id);
    return NextResponse.json(tenants);
    
  } catch (error) {
    console.error('GET /api/tenants error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    if (currentUser.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: "Unauthorized access" }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, listingId, roomId, leaseContract } = body;

    // Validate required fields
    if (!userId || !listingId || !leaseContract) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If roomId is provided, check if it's already occupied
    if (roomId) {
      const existingTenant = await prisma.tenantProfile.findFirst({
        where: { roomId }
      });

      if (existingTenant) {
        return NextResponse.json(
          { error: "This room is already occupied by another tenant" },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if listing exists and belongs to current user
    const listing = await prisma.listing.findUnique({
      where: { 
        id: listingId,
        userId: currentUser.id // Ensure listing belongs to current landlord
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      );
    }

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create tenant profile if it doesn't exist
      let tenantProfile = await tx.tenantProfile.findUnique({
        where: { userId }
      });

      if (!tenantProfile) {
        tenantProfile = await tx.tenantProfile.create({
          data: {
            userId,
            roomId: roomId || null,
            favoriteIds: []
          }
        });
      } else {
        // Update existing tenant profile
        tenantProfile = await tx.tenantProfile.update({
          where: { userId },
          data: {
            roomId: roomId || null
          }
        });
      }

      // 2. Update user role to TENANT
      await tx.user.update({
        where: { id: userId },
        data: { role: 'TENANT' }
      });

      // 3. Create lease contract
      const lease = await tx.leaseContract.create({
        data: {
          userId,
          listingId,
          tenantProfileId: tenantProfile.id,
          startDate: new Date(leaseContract.startDate),
          endDate: new Date(leaseContract.endDate),
          rentAmount: leaseContract.rentAmount,
          terms: leaseContract.terms
        }
      });

      // 4. If room is specified, update room's current tenants
      if (roomId) {
        await tx.room.update({
          where: { id: roomId },
          data: {
            currentTenants: {
              push: userId
            }
          }
        });
      }

      return { tenantProfile, lease };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('POST /api/tenants error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}

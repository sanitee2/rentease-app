import { NextRequest, NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getTenants from '@/app/actions/getTenants';
import prisma from '@/app/libs/prismadb';
import { PaymentStatus } from '@prisma/client';

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
    const { 
      userId, 
      listingId, 
      roomId,
      leaseContract: { 
        startDate, 
        rentAmount, 
        terms,
        monthlyDueDate,
        payment 
      } 
    } = body;

    // Validate required fields
    if (!userId || !listingId || !startDate || !rentAmount || !terms || !monthlyDueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate monthly due date
    if (monthlyDueDate < 1 || monthlyDueDate > 31) {
      return NextResponse.json(
        { error: "Monthly due date must be between 1 and 31" },
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
          startDate: new Date(startDate),
          rentAmount,
          terms,
          monthlyDueDate,
          isActive: true,
          userId,
          listingId,
          tenantProfileId: tenantProfile.id,
        }
      });

      // 4. Create initial payment record (PENDING)
      const dueDate = new Date(startDate);
      dueDate.setDate(monthlyDueDate);
      
      await tx.payment.create({
        data: {
          amount: 0, // No payment made yet
          totalAmount: rentAmount,
          status: PaymentStatus.PENDING,
          userId,
          leaseId: lease.id,
          tenantProfileId: tenantProfile.id,
          date: new Date(),
          dueDate,
          paymentPeriod: new Date(startDate),
          description: 'Initial rent payment',
          isPartial: false
        }
      });

      // 5. If room is specified, update room's current tenants
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

      return lease;
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

// Add GET method to fetch tenants
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: "Unauthorized access" }, 
        { status: 403 }
      );
    }

    // Get tenants with their active leases and related data
    const tenants = await prisma.tenantProfile.findMany({
      where: {
        leases: {
          some: {
            listing: {
              userId: currentUser.id
            },
            isActive: true
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            suffix: true,
            email: true,
            phoneNumber: true,
            image: true
          }
        },
        leases: {
          where: {
            isActive: true,
            listing: {
              userId: currentUser.id
            }
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                rooms: true
              }
            },
            payments: {
              where: {
                status: 'PENDING'
              },
              orderBy: {
                dueDate: 'asc'
              },
              take: 1
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        currentRoom: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    });

    // Transform the data to include computed fields
    const transformedTenants = tenants.map(tenant => ({
      id: tenant.user.id,
      firstName: tenant.user.firstName,
      middleName: tenant.user.middleName,
      lastName: tenant.user.lastName,
      suffix: tenant.user.suffix,
      email: tenant.user.email,
      phoneNumber: tenant.user.phoneNumber,
      image: tenant.user.image,
      currentRoom: tenant.currentRoom,
      leaseContracts: tenant.leases.map(lease => ({
        id: lease.id,
        startDate: lease.startDate,
        rentAmount: lease.rentAmount,
        monthlyDueDate: lease.monthlyDueDate,
        isActive: lease.isActive,
        listing: lease.listing,
        nextPayment: lease.payments[0] || null
      }))
    }));

    return NextResponse.json(transformedTenants);
  } catch (error: any) {
    console.error('GET /api/tenants error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
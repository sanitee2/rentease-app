import { NextRequest, NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getTenants from '@/app/actions/getTenants';
import prisma from '@/app/libs/prismadb';
import { LeaseStatus, PaymentStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      userId, 
      listingId, 
      roomId,
      tenantProfileId,
      leaseContract 
    } = body;

    // Validate required fields (excluding endDate)
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!listingId) missingFields.push('listingId');
    if (!tenantProfileId) missingFields.push('tenantProfileId');
    if (!leaseContract?.startDate) missingFields.push('leaseContract.startDate');
    if (!leaseContract?.rentAmount) missingFields.push('leaseContract.rentAmount');
    if (!leaseContract?.leaseTerms) missingFields.push('leaseContract.leaseTerms');
    if (!leaseContract?.monthlyDueDate) missingFields.push('leaseContract.monthlyDueDate');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          missingFields 
        },
        { status: 400 }
      );
    }

    // Create lease contract and update relationships in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create lease contract
      const lease = await tx.leaseContract.create({
        data: {
          userId,
          listingId,
          roomId: roomId || undefined,
          tenantProfileId,
          startDate: new Date(leaseContract.startDate),
          endDate: null,
          monthlyDueDate: leaseContract.monthlyDueDate,
          rentAmount: leaseContract.rentAmount,
          outstandingBalance: leaseContract.rentAmount,
          leaseTerms: leaseContract.leaseTerms,
          status: 'PENDING' as LeaseStatus
        }
      });

      // 2. Update tenant profile with currentRoom relation
      if (roomId) {
        await tx.tenantProfile.update({
          where: { id: tenantProfileId },
          data: { 
            currentRoom: {
              connect: { id: roomId }
            }
          }
        });

        // 3. Update room's tenants array
        await tx.room.update({
          where: { id: roomId },
          data: {
            tenants: {
              connect: { id: userId }
            }
          }
        });
      }

      // 4. Update user role to TENANT
      await tx.user.update({
        where: { id: userId },
        data: { role: 'TENANT' }
      });

      return lease;
    });

    // Return the created tenant with lease contract and room info
    const tenant = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        tenant: {
          select: {
            id: true,
            currentRoom: {
              select: {
                id: true,
                title: true,
                price: true
              },
            },
          },
        },
        leaseContracts: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyDueDate: true,
            rentAmount: true,
            status: true,
            room: {
              select: {
                id: true,
                title: true,
                price: true
              }
            },
            listing: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('[TENANTS_POST]', error);
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

    const tenants = await prisma.user.findMany({
      where: {
        leaseContracts: {
          some: {
            listing: {
              userId: currentUser.id
            }
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        email: true,
        phoneNumber: true,
        image: true,
        tenant: {
          select: {
            id: true,
            currentRoom: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        leaseContracts: {
          where: {
            listing: {
              userId: currentUser.id
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            monthlyDueDate: true,
            outstandingBalance: true,
            leaseTerms: true,
            status: true,
            createdAt: true,
            listing: {
              select: {
                id: true,
                title: true
              }
            },
            room: {
              select: {
                id: true,
                title: true
              }
            },
            Payment: {
              orderBy: {
                createdAt: 'desc'
              },
              select: {
                id: true,
                amount: true,
                status: true,
                paymentMethod: true,
                createdAt: true,
                description: true,
                periodStart: true,
                periodEnd: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(tenants);
  } catch (error: any) {
    console.error('[TENANTS_GET]', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
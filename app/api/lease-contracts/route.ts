import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

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
    const { userId, listingId, roomId, startDate, endDate, rentAmount, leaseTerms, monthlyDueDate } = body;

    // Create or get tenant profile and lease contract in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or create tenant profile
      let tenantProfile = await tx.tenantProfile.findUnique({
        where: { userId }
      });

      if (!tenantProfile) {
        tenantProfile = await tx.tenantProfile.create({
          data: {
            userId,
            favoriteIds: []
          }
        });
      }

      // 2. Create lease contract
      const leaseContract = await tx.leaseContract.create({
        data: {
          userId,
          listingId,
          roomId,
          tenantProfileId: tenantProfile.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          monthlyDueDate,
          rentAmount,
          leaseTerms,
          status: 'PENDING'
        },
        include: {
          listing: {
            select: {
              title: true,
              description: true
            }
          }
        }
      });

      return { tenantProfile, leaseContract };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[LEASE_CONTRACT_POST]', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 
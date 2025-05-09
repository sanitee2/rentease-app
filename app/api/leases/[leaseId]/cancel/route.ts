import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PATCH(
  request: Request,
  { params }: { params: { leaseId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { leaseId } = params;

    // Get the lease with all necessary relations
    const lease = await prisma.leaseContract.findUnique({
      where: { id: leaseId },
      include: {
        listing: true,
        room: true,
        tenantProfile: true,
      },
    });

    if (!lease) {
      return new NextResponse("Lease not found", { status: 404 });
    }

    // Update everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update lease status
      const updatedLease = await tx.leaseContract.update({
        where: { id: leaseId },
        data: { 
          status: 'CANCELLED',
          endDate: new Date()
        },
      });

      // 2. Remove room assignment if exists
      if (lease.roomId) {
        await tx.room.update({
          where: { id: lease.roomId },
          data: {
            tenants: {
              disconnect: { id: lease.userId }
            }
          }
        });
      }

      // 3. Update tenant profile
      if (lease.tenantProfileId) {
        await tx.tenantProfile.update({
          where: { id: lease.tenantProfileId },
          data: { roomId: null }
        });
      }

      // 4. Check if user has any other active leases
      const activeLeases = await tx.leaseContract.count({
        where: {
          userId: lease.userId,
          status: 'ACTIVE'
        }
      });

      // 5. If no active leases, update user role to USER
      if (activeLeases === 0) {
        await tx.user.update({
          where: { id: lease.userId },
          data: { role: 'USER' }
        });
      }

      return updatedLease;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[LEASE_CANCEL]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
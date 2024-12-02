import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PATCH(
  request: Request,
  { params }: { params: { leaseId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const { leaseId } = params;

    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!leaseId) {
      return NextResponse.json(
        { error: "Lease ID is required" },
        { status: 400 }
      );
    }

    // Get the lease to check if it exists and get related data
    const lease = await prisma.leaseContract.findUnique({
      where: { id: leaseId },
      include: {
        room: true,
        user: true,
      }
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    // Update everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update lease status and end date
      const updatedLease = await tx.leaseContract.update({
        where: { id: leaseId },
        data: {
          status: 'INACTIVE',
          endDate: new Date()
        }
      });

      // 2. Remove tenant from room if there is one
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

      // 3. Update user's role back to USER if they have no other active leases
      const otherActiveLeases = await tx.leaseContract.findFirst({
        where: {
          userId: lease.userId,
          id: { not: leaseId },
          status: 'ACTIVE'
        }
      });

      if (!otherActiveLeases) {
        await tx.user.update({
          where: { id: lease.userId },
          data: { role: 'USER' }
        });
      }

      // 4. Update tenant profile's currentRoom if it matches
      await tx.tenantProfile.updateMany({
        where: {
          userId: lease.userId,
          roomId: lease.roomId
        },
        data: {
          roomId: null
        }
      });

      return updatedLease;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[LEASE_END]', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
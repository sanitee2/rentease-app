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
        tenantProfile: true
      }
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    if (lease.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Only pending leases can be cancelled" },
        { status: 400 }
      );
    }

    // Update everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update lease status
      const updatedLease = await tx.leaseContract.update({
        where: { id: leaseId },
        data: {
          status: 'CANCELLED',
          endDate: new Date()
        }
      });

      // 2. Remove room reservation only if room exists and has tenant
      if (lease.roomId && lease.room) {
        const room = await tx.room.findUnique({
          where: { id: lease.roomId },
          include: { tenants: true }
        });

        if (room && room.tenants.some(tenant => tenant.id === lease.userId)) {
          await tx.room.update({
            where: { id: lease.roomId },
            data: {
              tenants: {
                disconnect: { id: lease.userId }
              }
            }
          });
        }
      }

      // 3. Update tenant profile only if it exists and has matching room
      if (lease.tenantProfileId && lease.tenantProfile?.roomId === lease.roomId) {
        await tx.tenantProfile.update({
          where: { id: lease.tenantProfileId },
          data: {
            roomId: null
          }
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
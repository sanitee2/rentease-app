import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function DELETE(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tenantId } = params;

    // Get the tenant with all necessary relations
    const tenant = await prisma.user.findUnique({
      where: { id: tenantId },
      include: {
        tenant: true,
        rentedRoom: true,
        leaseContracts: {
          where: {
            endDate: { gt: new Date() }
          }
        }
      }
    });

    if (!tenant) {
      return new NextResponse('Tenant not found', { status: 404 });
    }

    try {
      // Check if the room is already assigned to another tenant
      if (tenant.rentedRoom) {
        const conflictingTenant = await prisma.tenantProfile.findFirst({
          where: {
            roomId: tenant.rentedRoom.id,
            userId: { not: tenantId },
          },
        });

        if (conflictingTenant) {
          throw new Error('Conflict: The room is already assigned to another tenant.');
        }
      }

      // 1. Update the TenantProfile to remove the roomId
      await prisma.tenantProfile.update({
        where: { userId: tenantId },
        data: { roomId: null },
      });

      // 2. Update the Room's currentTenants
      if (tenant.rentedRoom) {
        await prisma.room.update({
          where: { id: tenant.rentedRoom.id },
          data: {
            currentTenants: {
              set: tenant.rentedRoom.currentTenants.filter(id => id !== tenantId),
            },
          },
        });
      }

      // 3. Handle lease contracts
      for (const lease of tenant.leaseContracts) {
        await prisma.leaseContract.update({
          where: { id: lease.id },
          data: {
            endDate: new Date(),
            terms: `${lease.terms}\nLease terminated early on ${new Date().toLocaleDateString()}`,
          },
        });
      }

      // 4. Finally update user role
      await prisma.user.update({
        where: { id: tenantId },
        data: {
          role: 'USER',
        },
      });

      return NextResponse.json({ 
        message: 'Tenant removed successfully',
        success: true 
      });

    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target === 'tenant_profiles_roomId_key') {
        return new NextResponse(
          'Conflict: The room is already assigned to another tenant.',
          { status: 409 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('[TENANT_REMOVE]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 
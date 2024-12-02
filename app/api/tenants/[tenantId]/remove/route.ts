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

    // Get the tenant with all necessary relations, focusing on TenantProfile's currentRoom
    const tenant = await prisma.user.findUnique({
      where: { id: tenantId },
      include: {
        tenant: {
          include: {
            currentRoom: {
              select: {
                id: true,
                currentTenants: true
              }
            }
          }
        },
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
      await prisma.$transaction(async (prisma) => {
        // 1. Update the Room's currentTenants array if there's a currentRoom in TenantProfile
        if (tenant.tenant?.currentRoom) {
          const currentRoom = tenant.tenant.currentRoom;
          const updatedTenants = currentRoom.currentTenants.filter(
            id => id !== tenantId
          );
          
          await prisma.room.update({
            where: { id: currentRoom.id },
            data: {
              currentTenants: updatedTenants
            }
          });
        }

        // 2. Update the TenantProfile to remove room reference
        if (tenant.tenant) {
          await prisma.tenantProfile.update({
            where: { userId: tenantId },
            data: {
              roomId: null
            }
          });
        }

        // 3. Handle lease contracts
        for (const lease of tenant.leaseContracts) {
          await prisma.leaseContract.update({
            where: { id: lease.id },
            data: {
              endDate: new Date(),
              leaseTerms: `${lease.leaseTerms}\nLease terminated early on ${new Date().toLocaleDateString()}`,
            },
          });
        }

        // 4. Update user role
        await prisma.user.update({
          where: { id: tenantId },
          data: {
            role: 'USER',
            roomId: null,
            listingId: null
          },
        });
      });

      return NextResponse.json({ 
        message: 'Tenant removed successfully',
        success: true 
      });

    } catch (error: any) {
      console.error('[TENANT_REMOVE_ERROR]', error);
      throw error;
    }

  } catch (error) {
    console.error('[TENANT_REMOVE]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 
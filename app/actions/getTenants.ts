
import prisma from "@/app/libs/prismadb";

export default async function getTenants(userId: string) {
  try {
    const tenants = await prisma.user.findMany({
      where: {
        role: 'TENANT',
        leaseContracts: {
          some: {
            listing: {
              userId: userId
            }
          }
        }
      },
      include: {
        tenant: {
          include: {
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
              userId: userId
            }
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      tenantProfile: tenant.tenant ? {
        id: tenant.tenant.id,
        currentRoom: tenant.tenant.currentRoom
      } : null,
      leaseContracts: tenant.leaseContracts.map(contract => ({
        id: contract.id,
        startDate: contract.startDate,
        endDate: contract.endDate,
        rentAmount: contract.rentAmount,
        listing: contract.listing
      }))
    }));
  } catch (error: any) {
    throw new Error(error);
  }
}
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
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        email: true,
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
              userId: userId
            }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            listing: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    return tenants.map(tenant => ({
      id: tenant.id,
      firstName: tenant.firstName,
      middleName: tenant.middleName || undefined,
      lastName: tenant.lastName,
      suffix: tenant.suffix || undefined,
      email: tenant.email,
      image: tenant.image || undefined,
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
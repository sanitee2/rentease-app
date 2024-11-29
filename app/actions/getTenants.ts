import prisma from "@/app/libs/prismadb";
import { TenantData } from "@/app/types";

export default async function getTenants(userId: string): Promise<TenantData[]> {
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
            endedAt: true,
            rentAmount: true,
            isActive: true,
            monthlyDueDate: true,
            listing: {
              select: {
                id: true,
                title: true
              }
            },
            payments: {
              select: {
                id: true,
                status: true,
                dueDate: true,
                amount: true
              }
            }
          }
        }
      }
    });

    const mappedTenants: TenantData[] = tenants.map(tenant => ({
      id: tenant.id,
      firstName: tenant.firstName,
      middleName: tenant.middleName,
      lastName: tenant.lastName,
      suffix: tenant.suffix,
      email: tenant.email,
      image: tenant.image,
      tenant: tenant.tenant ? {
        id: tenant.tenant.id,
        currentRoom: tenant.tenant.currentRoom
      } : null,
      leaseContracts: tenant.leaseContracts.map(contract => ({
        id: contract.id,
        startDate: contract.startDate,
        endedAt: contract.endedAt,
        rentAmount: contract.rentAmount,
        monthlyDueDate: contract.monthlyDueDate,
        isActive: contract.isActive,
        listing: contract.listing,
        payments: contract.payments
      }))
    }));

    return mappedTenants;
  } catch (error: any) {
    throw new Error(error);
  }
}
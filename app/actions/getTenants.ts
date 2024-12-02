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
          select: {
            id: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            monthlyDueDate: true,
            leaseTerms: true,
            status: true,
            createdAt: true,
            listing: {
              select: {
                id: true,
                title: true
              }
            },
            Payment: {
              select: {
                id: true,
                status: true,
                amount: true,
                periodStart: true,
                periodEnd: true,
                createdAt: true,
                paymentMethod: true,
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
        endDate: contract.endDate,
        rentAmount: contract.rentAmount,
        monthlyDueDate: contract.monthlyDueDate,
        leaseTerms: contract.leaseTerms,
        status: contract.status,
        createdAt: contract.createdAt,
        listing: contract.listing,
        Payment: contract.Payment
      }))
    }));

    return mappedTenants;
  } catch (error: any) {
    throw new Error(error);
  }
}
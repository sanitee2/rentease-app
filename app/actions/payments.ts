'use server'

import prisma from "@/app/libs/prismadb";
import { PaymentMode, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import getCurrentUser from "@/app/actions/getCurrentUser";

export type TenantWithLease = {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
  activeLeases?: {
    id: string;
    listingId: string;
    roomId: string | null;
    rentAmount: number;
    startDate: Date;
    payments?: {
      id: string;
      status: string;
      amount: number;
      periodStart: Date | null;
      periodEnd: Date | null;
    }[];
    listing: {
      title: string;
      userId: string;
    };
  }[];
}

export async function fetchTenants(): Promise<TenantWithLease[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) throw new Error("Unauthorized");

  const tenants = await prisma.tenantProfile.findMany({
    where: {
      leases: {
        some: {
          status: 'ACTIVE',
          listing: {
            userId: currentUser.id
          }
        }
      },
      user: {
        is: {
          id: {
            not: undefined
          }
        }
      }
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      leases: {
        where: {
          status: 'ACTIVE',
          listing: {
            userId: currentUser.id
          }
        },
        select: {
          id: true,
          listingId: true,
          roomId: true,
          rentAmount: true,
          startDate: true,
          Payment: {
            select: {
              id: true,
              status: true,
              amount: true,
              periodStart: true,
              periodEnd: true
            }
          },
          listing: {
            select: {
              title: true,
              userId: true
            }
          }
        }
      }
    }
  });

  return tenants
    .filter(tenant => tenant.leases.length > 0 && tenant.user)
    .map(tenant => ({
      id: tenant.id,
      userId: tenant.userId,
      user: {
        firstName: tenant.user.firstName,
        lastName: tenant.user.lastName
      },
      activeLeases: tenant.leases
    }));
}

export type PaymentData = {
  leaseId: string;
  listingId: string;
  landlordId: string;
  roomId?: string;
  amount: number;
  mode: PaymentMode;
  proofImage?: string;
  description?: string;
  status: PaymentStatus;
  userId: string;
  periodStart?: Date;
  periodEnd?: Date;
}

export async function createPayment(data: PaymentData) {
  try {
    const payment = await prisma.payment.create({
      data: {
        leaseId: data.leaseId,
        listingId: data.listingId,
        amount: data.amount,
        paymentMethod: data.mode,
        image: data.proofImage,
        description: data.description,
        status: data.status,
        userId: data.userId,
        roomId: data.roomId,
      }
    });

    revalidatePath('/landlord/payments');
    return { success: true, payment };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { success: false, error: 'Failed to create payment' };
  }
}

export async function createLandlordPayment(data: PaymentData) {
  try {
    // First get the lease to update outstanding balance
    const lease = await prisma.leaseContract.findUnique({
      where: { id: data.leaseId },
      include: {
        tenantProfile: true
      }
    });

    if (!lease) {
      throw new Error("Lease not found");
    }

    // Create the payment with proper relations
    const payment = await prisma.payment.create({
      data: {
        // Required relations
        user: {
          connect: { id: data.userId }
        },
        lease: {
          connect: { id: data.leaseId }
        },
        // Optional relations
        TenantProfile: lease.tenantProfile ? {
          connect: { id: lease.tenantProfile.id }
        } : undefined,
        Listing: data.listingId ? {
          connect: { id: data.listingId }
        } : undefined,
        Room: data.roomId ? {
          connect: { id: data.roomId }
        } : undefined,
        // Payment fields
        amount: data.amount,
        paymentMethod: data.mode,
        status: data.status,
        description: data.description || undefined,
        image: data.proofImage || undefined,
        periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : undefined,
      }
    });

    // Update lease outstanding balance
    if (payment.status === 'COMPLETED') {
      await prisma.leaseContract.update({
        where: { id: data.leaseId },
        data: {
          outstandingBalance: {
            decrement: data.amount
          }
        }
      });
    }

    revalidatePath('/landlord/payments');
    return { success: true, payment };
  } catch (error) {
    console.error('Error creating landlord payment:', error);
    return { success: false, error: 'Failed to create payment' };
  }
} 
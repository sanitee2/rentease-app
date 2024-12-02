import prisma from '@/app/libs/prismadb';
import { SafeUser } from '@/app/types';

export async function getDashboardData(userId: string) {
  try {
    // First get the current active lease
    const currentLease = await prisma.leaseContract.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        status: true,
        rentAmount: true,
        startDate: true,
        endDate: true,
        leaseTerms: true,
        outstandingBalance: true,
        monthlyDueDate: true,
        listing: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      }
    });

    if (!currentLease) {
      return {
        leases: [],
        payments: [],
        maintenanceRequests: [],
        currentLease: null,
        host: null
      };
    }

    // Get payments related to current lease only
    const payments = await prisma.payment.findMany({
      where: {
        leaseId: currentLease.id
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        paymentMethod: true,
        description: true,
        periodStart: true,
        periodEnd: true,
        image: true,
        Listing: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get maintenance requests related to current lease's listing only
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        userId,
        listingId: currentLease.listing.id
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        images: true,
        priority: true,
        title: true,
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get the host (landlord) of the current listing
    const hostUser = await prisma.user.findFirst({
      where: {
        ownedListings: {
          some: {
            id: currentLease.listing.id
          }
        }
      }
    });

    const transformedCurrentLease = {
      id: currentLease.id,
      status: currentLease.status,
      rentAmount: currentLease.rentAmount,
      startDate: currentLease.startDate,
      endDate: currentLease.endDate === null ? undefined : currentLease.endDate,
      leaseTerms: currentLease.leaseTerms,
      monthlyDueDate: currentLease.monthlyDueDate,
      outstandingBalance: currentLease.outstandingBalance,
      listing: currentLease.listing
    };

    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      paymentMethod: payment.paymentMethod,
      description: payment.description || undefined,
      periodStart: payment.periodStart || undefined,
      periodEnd: payment.periodEnd || undefined,
      image: payment.image || undefined,
      listing: payment.Listing || undefined
    }));

    const transformedMaintenanceRequests = maintenanceRequests.map(request => ({
      id: request.id,
      description: request.description,
      status: request.status,
      createdAt: request.createdAt,
      images: request.images,
      priority: request.priority,
      title: request.title,
      listing: {
        id: request.listing.id,
        title: request.listing.title
      }
    }));

    const safeHost = hostUser ? {
      ...hostUser,
      createdAt: hostUser.createdAt.toISOString(),
      updatedAt: hostUser.updatedAt.toISOString(),
      emailVerified: hostUser.emailVerified?.toISOString() || null
    } : null;

    return {
      currentLease: transformedCurrentLease,
      payments: transformedPayments,
      maintenanceRequests: transformedMaintenanceRequests,
      host: safeHost,
      leases: [transformedCurrentLease] // Only include current lease
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
} 
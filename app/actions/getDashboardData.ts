import prisma from '@/app/libs/prismadb';
import { SafeUser } from '@/app/types';

export async function getDashboardData(userId: string) {
  try {
    // Get all leases including pending ones
    const leases = await prisma.leaseContract.findMany({
      where: {
        userId: userId,
      },
      include: {
        listing: true,
        room: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform all leases first
    const transformedLeases = leases.map(lease => ({
      id: lease.id,
      status: lease.status,
      rentAmount: lease.rentAmount,
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyDueDate: lease.monthlyDueDate,
      outstandingBalance: lease.outstandingBalance,
      leaseTerms: lease.leaseTerms,
      listing: {
        id: lease.listing.id,
        title: lease.listing.title,
        description: lease.listing.description
      },
      room: lease.room ? {
        id: lease.room.id,
        title: lease.room.title
      } : undefined
    }));

    // Get current active lease
    const currentLease = leases.find(lease => lease.status === 'ACTIVE');

    if (!currentLease) {
      return {
        leases: transformedLeases,
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
        declineReason: true,
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
      declineReason: payment.declineReason || undefined,
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
      leases: transformedLeases
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
} 
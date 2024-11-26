import prisma from '@/app/libs/prismadb';
import { UserRole } from '@prisma/client';
import { startOfDay, endOfDay, format } from 'date-fns';

export default async function getDashboardChartData() {
  // Get listing status distribution
  const listingStatusCounts = await prisma.listing.groupBy({
    by: ['status'],
    _count: true,
  });

  const listingStatus = listingStatusCounts.map(({ status, _count }) => ({
    label: status,
    value: _count,
    color: {
      PENDING: '#fbbf24',
      ACTIVE: '#22c55e',
      DECLINED: '#ef4444',
      ARCHIVED: '#94a3b8',
    }[status],
  }));

  // Get daily listings for more granular data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const dailyListings = await prisma.listing.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startOfDay(sixMonthsAgo),
        lte: endOfDay(new Date()),
      },
    },
    _count: true,
  });

  const dailyData = dailyListings.map(({ createdAt, _count }) => ({
    date: createdAt,
    month: format(createdAt, 'MMM yyyy'),
    count: _count,
  }));

  // Get payment status distribution
  const paymentStatusCounts = await prisma.payment.groupBy({
    by: ['status'],
    _count: true,
  });

  const paymentStatus = paymentStatusCounts.map(({ status, _count }) => ({
    label: status,
    value: _count,
    color: {
      PENDING: '#fbbf24',
      COMPLETED: '#22c55e',
      FAILED: '#ef4444',
    }[status],
  }));

  // Get maintenance request status distribution
  const maintenanceStatusCounts = await prisma.maintenanceRequest.groupBy({
    by: ['status'],
    _count: true,
  });

  const maintenanceStatus = maintenanceStatusCounts.map(({ status, _count }) => ({
    label: status,
    value: _count,
    color: {
      PENDING: '#fbbf24',
      IN_PROGRESS: '#3b82f6',
      COMPLETED: '#22c55e',
      CANCELLED: '#94a3b8',
    }[status],
  }));

  // Get user counts by role and date
  const getUserStats = async () => {
    const users = await prisma.user.findMany({
      select: {
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Initialize data structure with dates
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Last 6 months
    
    const dailyData: Record<string, {
      date: Date;
      label: string;
      month: string;
      counts: Record<UserRole, number>;
    }> = {};

    // Initialize all dates with zero counts
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'yyyy-MM-dd');
      dailyData[dateKey] = {
        date: new Date(d),
        label: format(d, 'MMM dd, yyyy'),
        month: format(d, 'MMM yyyy'),
        counts: {
          ADMIN: 0,
          TENANT: 0,
          LANDLORD: 0,
          USER: 0,
        },
      };
    }

    // Calculate cumulative counts
    users.forEach((user) => {
      const userDate = startOfDay(user.createdAt);
      
      // Update counts for this date and all future dates
      Object.keys(dailyData).forEach((dateKey) => {
        const currentDate = new Date(dateKey);
        if (currentDate >= userDate) {
          dailyData[dateKey].counts[user.role]++;
        }
      });
    });

    return Object.values(dailyData);
  };

  const userStats = await getUserStats();

  return {
    listingStatus,
    monthlyListings: dailyData,
    paymentStatus,
    maintenanceStatus,
    userCounts: userStats,
  };
}

// Add type definition
export interface ChartData {
  listingStatus: {
    label: string;
    value: number;
    color: string;
  }[];
  monthlyListings: {
    date: Date;
    month: string;
    count: number;
  }[];
  paymentStatus: {
    label: string;
    value: number;
    color: string;
  }[];
  maintenanceStatus: {
    label: string;
    value: number;
    color: string;
  }[];
  userCounts: {
    date: Date;
    label: string;
    month: string;
    counts: Record<UserRole, number>;
  }[];
} 
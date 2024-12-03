'use client';

import { useMemo, useState } from 'react';
import type { FC, ReactElement } from 'react';
import Container from '@/app/components/Container';
import TenantStats from './TenantStats';
import ActiveLease from './ActiveLease';
import PaymentHistory from './PaymentHistory';
import MaintenanceRequests from './MaintenanceRequests';
import { SafeUser } from '@/app/types';
import { 
  FaHome,           // For Active Leases
  FaMoneyBillWave,  // For Total Paid
  FaClipboardList,  // For Pending Payments
  FaExclamation,    // For Outstanding Balance
  FaBell,
  FaFileInvoiceDollar,
  FaWrench,
  FaEnvelope,
  FaFileContract 
} from 'react-icons/fa';
import { 
  LuHome,           // Alternative for Active Leases
  LuWallet,         // Alternative for Total Paid
  LuClock,          // Alternative for Pending Payments
  LuAlertCircle     // Alternative for Outstanding Balance
} from 'react-icons/lu';
import HostInfo from './HostInfo';
import { PaymentStatus, PaymentMode, LeaseStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import PendingLeaseAlert from './PendingLeaseAlert';
import EmptyState from '@/app/components/EmptyState';
import PaymentDialog from '@/app/components/Modals/PaymentDialog';
import MaintenanceRequestDialog from '@/app/components/Modals/MaintenanceRequestDialog';
import axios from 'axios';
import { addDays, format } from 'date-fns';

// Update types to match our schema and data structure
export interface DashboardData {
  leases: {
    id: string;
    status: LeaseStatus;
    rentAmount: number;
    startDate: Date;
    endDate?: Date | null;
    monthlyDueDate: number;
    outstandingBalance: number;
    leaseTerms: string;
    
    listing: {
      id: string;
      title: string;
      description: string;
    };
    room?: {  // Add room data here too
      id: string;
      title: string;
    };
  }[];
  payments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    paymentMethod: PaymentMode;
    description?: string;
    image?: string;
    periodStart?: Date;
    periodEnd?: Date;
    listing?: {
      id: string;
      title: string;
    };
  }[];
  maintenanceRequests: {
    id: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: Date;
    images?: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    title: string;
    listing: {
      id: string;
      title: string;
    };
  }[];
  currentLease: {
    id: string;
    status: LeaseStatus;
    rentAmount: number;
    startDate: Date;
    endDate?: Date;
    leaseTerms: string;
    outstandingBalance: number;
    monthlyDueDate: number;
    listing: {
      id: string;
      title: string;
      description: string;
    };
    room?: {  // Add room data here too
      id: string;
      title: string;
    };
  } | null;
  host: SafeUser | null;
}

interface DashboardClientProps {
  currentUser: SafeUser | null;
  initialData: DashboardData | null;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
}

const DashboardClient: FC<DashboardClientProps> = ({ 
  currentUser,
  initialData 
}) => {
  const router = useRouter();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [newInitialData, setNewInitialData] = useState<DashboardData | null>(null);

  const currentLease = initialData?.currentLease;

  const quickActions: QuickAction[] = [
    {
      label: 'Pay Rent',
      description: 'Make a payment for your current lease',
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
      onClick: () => setShowPaymentDialog(true),
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Submit Request',
      description: 'Report maintenance issues or concerns',
      icon: <FaWrench className="w-5 h-5" />,
      onClick: () => setShowMaintenanceDialog(true),
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-500'
    },
  ];

  const stats = useMemo(() => {
    if (!initialData) {
      return {
        nextDueDate: null,
        totalPaid: 0,
        pendingPayments: 0,
        outstandingBalance: 0,
        leases: [],
        paidPeriodRange: null,
        balanceDescription: null
      };
    }

    // Get first and last completed payments with periods
    const completedPayments = initialData.payments
      .filter(payment => 
        payment.status === 'COMPLETED' && 
        payment.periodStart &&
        payment.periodEnd
      )
      .sort((a, b) => 
        new Date(a.periodStart!).getTime() - new Date(b.periodStart!).getTime()
      );

    const firstPayment = completedPayments[0];
    const lastPayment = completedPayments[completedPayments.length - 1];

    // Create paid period range description
    const paidPeriodRange = firstPayment && lastPayment 
      ? `Paid period: ${format(new Date(firstPayment.periodStart!), 'MMM d, yyyy')} - ${format(new Date(lastPayment.periodEnd!), 'MMM d, yyyy')}`
      : null;

    // Calculate next due date based on latest payment period and payment completeness
    const nextDueDate = initialData.currentLease?.monthlyDueDate 
      ? (() => {
          // Get all completed payments grouped by period
          const paymentsByPeriod = initialData.payments
            .filter(payment => 
              payment.status === 'COMPLETED' && 
              payment.periodStart &&
              payment.periodEnd
            )
            .reduce((acc, payment) => {
              const periodKey = payment.periodStart!.toString();
              if (!acc[periodKey]) {
                acc[periodKey] = {
                  periodStart: new Date(payment.periodStart!),
                  periodEnd: new Date(payment.periodEnd!),
                  totalPaid: 0
                };
              }
              acc[periodKey].totalPaid += payment.amount;
              return acc;
            }, {} as Record<string, { periodStart: Date; periodEnd: Date; totalPaid: number }>);

          // Convert to array and sort by period start date
          const sortedPeriods = Object.values(paymentsByPeriod)
            .sort((a, b) => b.periodStart.getTime() - a.periodStart.getTime());

          // Get the latest period
          const latestPeriod = sortedPeriods[0];

          if (latestPeriod) {
            const rentAmount = initialData.currentLease.rentAmount;
            
            // If the latest period is not fully paid, use its end date as next due date
            if (latestPeriod.totalPaid < rentAmount) {
              return new Date(
                latestPeriod.periodEnd.getFullYear(),
                latestPeriod.periodEnd.getMonth(),
                initialData.currentLease.monthlyDueDate
              );
            }

            // If fully paid, set due date to the next month after the period end
            return new Date(
              latestPeriod.periodEnd.getFullYear(),
              latestPeriod.periodEnd.getMonth() + 1,
              initialData.currentLease.monthlyDueDate
            );
          } else {
            // If no payments found, use current month's due date
            const today = new Date();
            const dueDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              initialData.currentLease.monthlyDueDate
            );
            
            // If today's date is past this month's due date, get next month's due date
            if (today > dueDate) {
              return new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                initialData.currentLease.monthlyDueDate
              );
            }
            return dueDate;
          }
        })()
      : null;

    // Calculate total paid from payments
    const totalPaid = initialData.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Get pending payments count
    const pendingPayments = initialData.payments
      .filter(payment => payment.status === 'PENDING')
      .length;

    // Get outstanding balance from current lease
    const rawOutstandingBalance = initialData.currentLease?.outstandingBalance || 0;
    const outstandingBalance = Math.max(0, rawOutstandingBalance);
    const balanceDescription = rawOutstandingBalance < 0 
      ? `You are advance paid until ${lastPayment ? format(new Date(lastPayment.periodEnd!), 'MMM d, yyyy') : 'your last payment period'}`
      : undefined;

    return {
      nextDueDate,
      totalPaid,
      pendingPayments,
      outstandingBalance,
      leases: [initialData.currentLease].filter(Boolean),
      paidPeriodRange,
      balanceDescription
    };
  }, [initialData]);

  console.log(initialData);

  console.log('Initial data in DashboardClient:', initialData);
  
  const pendingLease = useMemo(() => {
    const pending = initialData?.leases?.find(lease => lease.status === 'PENDING');
    console.log('Found pending lease:', pending);
    return pending;
  }, [initialData?.leases]);

  console.log('Pending Lease:', pendingLease);

  const refreshPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      // Update only the payments data
      setNewInitialData(prev => prev ? {
        ...prev,
        payments: response.data
      } : prev);
    } catch (error) {
      console.error('Failed to refresh payments:', error);
    }
  };

  return (
    <Container>
      <div className="py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser?.firstName}
            </h1>
            <p className="text-gray-500 mt-2">
              Here's what's happening with your rental
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column (3/4) */}
          <div className="lg:col-span-3 space-y-8">
            {!initialData ? (
              <EmptyState
                title="No dashboard data"
                subtitle="Unable to load dashboard data. Please try again later."
              />
            ) : (
              <>
                {pendingLease && (
                  <div className="mb-6">
                    <PendingLeaseAlert lease={pendingLease} />
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <TenantStats
                    icon={LuClock}
                    label="Next Due Date"
                    value={stats.nextDueDate ? format(stats.nextDueDate, 'MMM d, yyyy') : 'No active lease'}
                    description={stats.paidPeriodRange || undefined}
                  />
                  <TenantStats
                    icon={LuWallet}
                    label="Total Paid"
                    value={`₱${stats.totalPaid.toFixed(2)}`}
                  />
                  <TenantStats
                    icon={LuAlertCircle}
                    label="Outstanding Balance"
                    value={`₱${stats.outstandingBalance.toFixed(2)}`}
                    description={stats.balanceDescription || undefined}
                  />
                </div>

                <ActiveLease lease={initialData.currentLease} />
                <PaymentHistory 
                  payments={initialData.payments} 
                  initialData={initialData}
                />
                <MaintenanceRequests requests={initialData.maintenanceRequests} />
              </>
            )}
          </div>
          
          {/* Right Column (1/4) */}
          <div className="flex flex-col space-y-4">
            {/* Quick Actions Card */}
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Common tasks and shortcuts
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={`group relative w-full ${action.bgColor} ${action.textColor} p-4 rounded-xl 
                          border ${action.borderColor} hover:shadow-md transition-all duration-200
                          hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`${action.iconBg} text-white p-2.5 rounded-lg 
                            shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-200`}>
                            {action.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold mb-1">
                              {action.label}
                            </h3>
                            <p className="text-sm opacity-80">
                              {action.description}
                            </p>
                          </div>
                          <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 5l7 7-7 7" 
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Host Info Card */}
            <div className="order-1 md:order-2">
              <HostInfo host={initialData?.host} />
            </div>
          </div>
        </div>
      </div>

      
      <MaintenanceRequestDialog
        isOpen={showMaintenanceDialog}
        onClose={() => setShowMaintenanceDialog(false)}
        listingId={initialData?.currentLease?.listing?.id}
        roomId={initialData?.currentLease?.room?.id}
        listing={initialData?.currentLease?.listing}
        room={initialData?.currentLease?.room}
      />

      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        leaseId={initialData?.currentLease?.id}
        listingId={initialData?.currentLease?.listing?.id}
        landlordId={initialData?.host?.id}
        rentAmount={initialData?.currentLease?.rentAmount}
        outstandingBalance={initialData?.currentLease?.outstandingBalance}
        monthlyDueDate={initialData?.currentLease?.monthlyDueDate}
        listing={initialData?.currentLease?.listing}
        room={initialData?.currentLease?.room}
        onSuccess={refreshPayments}
        payments={initialData?.payments || []}
      />
    </Container>      
  );
};

export default DashboardClient;

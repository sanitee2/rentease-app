import { format } from 'date-fns';
import { FaCheckCircle, FaTimesCircle, FaClock, FaChevronRight, FaBan } from 'react-icons/fa';
import EmptyState from './EmptyState';
import { PaymentStatus, PaymentMode } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Eye, X } from "lucide-react";
import TenantPaymentDetailsModal from '@/app/components/Modals/TenantPaymentDetailsModal';
import { useState } from 'react';
import { DashboardData } from './DashboardClient';

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  paymentMethod: PaymentMode;
  description?: string;
  image?: string;
  periodStart?: Date;
  periodEnd?: Date;
  declineReason?: string;
  listing?: {
    id: string;
    title: string;
  };
}

interface PaymentHistoryProps {
  payments: Payment[];
  initialData: DashboardData;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments, initialData }) => {
  const router = useRouter();
  const displayPayments = payments.slice(0, 4); // Show only 4 latest payments
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  console.log(payments);

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="text-green-500 w-5 h-5" />;
      case 'FAILED':
        return <FaTimesCircle className="text-red-500 w-5 h-5" />;
      case 'CANCELLED':
        return <FaBan className="text-gray-500 w-5 h-5" />;
      default:
        return <FaClock className="text-yellow-500 w-5 h-5" />;
    }
  };

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!payments?.length) {
    return (
      <EmptyState 
        type="payment"
        subtitle="Your payment history will be displayed here once you make your first payment."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest payment transactions</p>
          </div>
          {payments.length > 4 && (
            <Button
              onClick={() => router.push('/payments')}
              variant="ghost"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View All
              <FaChevronRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {displayPayments.map((payment) => (
          <div 
            key={payment.id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-4">
              {getStatusIcon(payment.status)}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${getStatusStyle(payment.status)}
                  `}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>{payment.paymentMethod}</span>
                  <span>•</span>
                  <span>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</span>
                  {payment.periodStart && payment.periodEnd && (
                    <>
                      <span className="hidden md:inline-block">•</span>
                      <span className="hidden md:inline-block">
                        Period: {format(new Date(payment.periodStart), 'MMM d')} - {format(new Date(payment.periodEnd), 'MMM d, yyyy')}
                      </span>
                    </>
                  )}
                </div>
                {payment.description && (
                  <p className="text-sm text-gray-500 mt-1">{payment.description}</p>
                )}
                {payment.status === 'FAILED' && (
                  <div className="flex items-center gap-1 mt-1">
                    <X className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">Payment declined</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPayment({
                ...payment,
                listing: initialData.currentLease?.listing,
                declineReason: payment.declineReason
              })}
              className="text-blue-600 hover:text-blue-900"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <Button
            onClick={() => router.push('/payments')}
            variant="ghost"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            View All Payments
            <FaChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

      {selectedPayment && (
        <TenantPaymentDetailsModal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
        />
      )}
    </div>
  );
};

export default PaymentHistory; 
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { PaymentStatus, PaymentType } from '@prisma/client';

interface Payment {
  id: string;
  amount: number;
  totalAmount: number;
  remainingBalance?: number;
  dueDate?: Date;
  status: PaymentStatus;
  paymentType: PaymentType;
  lease: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
    listing: {
      id: string;
      title: string;
    };
  };
}

export default function UpcomingPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('/api/landlord/upcoming-payments');
        setPayments(response.data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-gray-500">Loading payments...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No upcoming payments found</p>
        <p className="text-sm text-gray-400 mt-1">Payments will appear here when tenants have pending dues</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">
              {payment.lease?.user?.firstName} {payment.lease?.user?.lastName}
            </p>
            <p className="text-sm text-gray-500">{payment.lease?.listing?.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">₱{payment.amount?.toLocaleString()}</p>
            {payment.dueDate && (
              <p className="text-xs text-gray-500">
                Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 
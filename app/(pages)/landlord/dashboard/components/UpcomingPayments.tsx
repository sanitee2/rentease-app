'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function UpcomingPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const response = await axios.get('/api/landlord/upcoming-payments');
      setPayments(response.data);
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-4">
      {payments.map((payment: any) => (
        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{payment.tenant.firstName} {payment.tenant.lastName}</p>
            <p className="text-sm text-gray-500">{payment.listing.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">₱{payment.amount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 
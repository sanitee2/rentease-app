'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  tenant: {
    firstName: string;
    lastName: string;
  };
  listing: {
    id: string;
    title: string;
  };
}

export default function RecentLeases() {
  const [leases, setLeases] = useState<Lease[]>([]);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const response = await axios.get('/api/landlord/recent-leases');
        setLeases(response.data);
      } catch (error) {
        console.error('Failed to fetch leases:', error);
      }
    };
    fetchLeases();
  }, []);

  return (
    <div className="space-y-4">
      {leases.map((lease) => (
        <div key={lease.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">
              {lease.tenant.firstName} {lease.tenant.lastName}
            </p>
            <p className="text-sm text-gray-500">{lease.listing.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">₱{lease.rentAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(lease.startDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 
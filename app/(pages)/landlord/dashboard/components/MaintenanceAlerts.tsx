'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function MaintenanceAlerts() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const response = await axios.get('/api/landlord/maintenance-requests');
      setRequests(response.data);
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-4">
      {requests.map((request: any) => (
        <div key={request.id} className="p-4 bg-red-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{request.listing.title}</p>
              <p className="text-sm text-gray-600 mt-1">{request.description}</p>
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(request.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 
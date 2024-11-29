'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function MaintenanceAlerts() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/landlord/maintenance-requests');
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch maintenance requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-gray-500">Loading maintenance requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No pending maintenance requests</p>
        <p className="text-sm text-gray-400 mt-1">All maintenance requests are currently resolved</p>
      </div>
    );
  }

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
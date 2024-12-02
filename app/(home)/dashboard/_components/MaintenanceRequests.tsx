import { format } from 'date-fns';
import { FaTools, FaSpinner, FaCheckCircle, FaTimesCircle, FaChevronRight } from 'react-icons/fa';
import EmptyState from './EmptyState';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Eye } from "lucide-react";
import TenantMaintenanceDetailsModal from '@/app/components/Modals/TenantMaintenanceDetailsModal';
import { useState } from 'react';
import { MaintenanceRequest } from '@/app/types';

interface MaintenanceRequestsProps {
  requests: {
    id: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: Date;
    images?: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    title: string;
  }[];
}

const MaintenanceRequests: React.FC<MaintenanceRequestsProps> = ({ requests }) => {
  const router = useRouter();
  const displayRequests = requests.slice(0, 4); // Show only 4 latest requests
  const [selectedRequest, setSelectedRequest] = useState<Partial<MaintenanceRequest> | null>(null);

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <FaTools className="text-yellow-500 w-5 h-5" />;
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="text-green-500 w-5 h-5" />;
      case 'IN_PROGRESS':
        return <FaSpinner className="text-blue-500 w-5 h-5 animate-spin" />;
      case 'CANCELLED':
        return <FaTimesCircle className="text-red-500 w-5 h-5" />;
      default:
        return <FaTools className="text-yellow-500 w-5 h-5" />;
    }
  };

  const getStatusStyle = (status: string | undefined) => {
    if (!status) return 'bg-yellow-100 text-yellow-800';
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!requests?.length) {
    return (
      <EmptyState 
        type="maintenance"
        subtitle="Submit a maintenance request if you need any repairs or have concerns."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Track your maintenance requests</p>
          </div>
            <Button
              onClick={() => router.push('/maintenance')}
              variant="ghost"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View All
              <FaChevronRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {displayRequests.map((request) => (
          <div 
            key={request.id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-4">
              {getStatusIcon(request.status)}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium line-clamp-1">{request.description}</p>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${getStatusStyle(request.status)}
                  `}>
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => request.id && setSelectedRequest({
                ...request,
                createdAt: request.createdAt.toISOString()
              })}
              className="text-blue-600 hover:text-blue-900"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {requests.length > 4 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <Button
            onClick={() => router.push('/maintenance')}
            variant="ghost"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            View All {requests.length} Requests
            <FaChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}

      {selectedRequest && (
        <TenantMaintenanceDetailsModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
          setSelectedRequest={setSelectedRequest}
        />
      )}
    </div>
  );
};

export default MaintenanceRequests; 
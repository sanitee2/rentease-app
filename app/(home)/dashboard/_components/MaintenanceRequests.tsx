import { format } from 'date-fns';
import { FaTools, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface MaintenanceRequest {
  id: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

interface MaintenanceRequestsProps {
  requests: MaintenanceRequest[];
}

const MaintenanceRequests: React.FC<MaintenanceRequestsProps> = ({ requests }) => {
  const getStatusIcon = (status: string) => {
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

  if (!requests.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No maintenance requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id}
          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-start gap-3">
            {getStatusIcon(request.status)}
            <div className="flex-1">
              <p className="font-medium line-clamp-2">{request.description}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </p>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                  ${request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : ''}
                  ${request.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                  ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceRequests; 
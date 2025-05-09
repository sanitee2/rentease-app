'use client';

import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaHome, 
  FaDoorOpen,
  FaCheckCircle, 
  FaTimesCircle, 
  FaBan 
} from "react-icons/fa";
import { RequestViewingStatus } from "@prisma/client";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ViewingRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    status: RequestViewingStatus;
    date: Date;
    time: Date;
    createdAt: Date;
    declineReason?: string | null;
    listing: {
      id: string;
      title: string;
      user?: {
        firstName: string;
        lastName: string;
        email?: string | null;
        phoneNumber?: string | null;
      };
    };
    room?: {
      id: string;
      title: string;
    } | null;
  };
}

const ViewingRequestDetailsModal: React.FC<ViewingRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: RequestViewingStatus) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'DECLINED':
        return <FaTimesCircle className="text-rose-500" />;
      case 'CANCELLED':
        return <FaBan className="text-gray-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusClass = (status: RequestViewingStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-600';
      case 'DECLINED':
        return 'bg-rose-100 text-rose-600';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/viewing-requests/${request.id}`, {
        status: 'CANCELLED'
      });
      toast.success('Viewing request cancelled successfully');
      router.refresh();
      onClose();
    } catch (error) {
      toast.error('Failed to cancel viewing request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Viewing Request Details</span>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-2 ${getStatusClass(request.status)}`}>
              {getStatusIcon(request.status)}
              {request.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaHome className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Property</h3>
                <p className="text-gray-600">{request.listing.title}</p>
              </div>
            </div>

            {request.room && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FaDoorOpen className="text-indigo-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Room</h3>
                  <p className="text-gray-600">{request.room.title}</p>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Details */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FaCalendarAlt className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Viewing Date</h3>
                <p className="text-gray-600">{format(new Date(request.date), 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FaClock className="text-purple-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Viewing Time</h3>
                <p className="text-gray-600">{format(new Date(request.time), 'h:mm a')}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {request.declineReason && request.status === 'DECLINED' && (
            <div className="bg-rose-50 p-4 rounded-lg">
              <h3 className="font-medium text-rose-900 mb-1">Decline Reason</h3>
              <p className="text-rose-600">{request.declineReason}</p>
            </div>
          )}

          {/* Request Information */}
          <div className="text-sm text-gray-500">
            <p>Requested on {format(new Date(request.createdAt), 'MMMM d, yyyy')}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {request.status === 'PENDING' && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewingRequestDetailsModal; 
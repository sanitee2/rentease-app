'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { 
  Calendar,
  Clock,
  Home,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  ImageIcon,
  Eye,
  ZoomIn
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { STATUS_STYLES, PRIORITY_STYLES } from '@/app/constants/maintenance';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  images?: string[];
  tenant: {
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
  };
  listing: {
    title: string;
  };
  room?: {
    title: string;
  } | null;
}

interface MaintenanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MaintenanceRequest;
}

export default function MaintenanceDetailsModal({
  isOpen,
  onClose,
  request
}: MaintenanceDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: MaintenanceRequest['status']) => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/maintenance/${request.id}`, { status: newStatus });
      toast.success('Status updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Maintenance Request Details</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Submitted on {format(new Date(request.createdAt), 'MMMM d, yyyy')}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${STATUS_STYLES[request.status].badge}`}>
            {request.status}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{request.title}</h3>
              <Badge 
                variant="outline" 
                className={`capitalize ${PRIORITY_STYLES[request.priority].badge}`}
              >
                {request.priority.toLowerCase()} Priority
              </Badge>
            </div>

            <div className="bg-indigo-50/50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-100">
                  <Image
                    src={request.tenant.image || '/images/placeholder.jpg'}
                    alt={request.tenant.firstName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.tenant.firstName} {request.tenant.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{request.tenant.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Home className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium text-gray-900">Property Details</h3>
              </div>
              <div className="ml-8 space-y-1">
                <p className="text-gray-700">{request.listing.title}</p>
                {request.room && (
                  <p className="text-gray-500">Room: {request.room.title}</p>
                )}
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium text-gray-900">Issue Description</h3>
              </div>
              <p className="text-gray-600 ml-8">{request.description}</p>
            </div>

            {request.images && request.images.length > 0 && (
              <div className="bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ImageIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-900">Attached Images</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ml-8">
                  {request.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition group border border-indigo-100"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`Maintenance request image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-indigo-100 bg-indigo-50/50 flex justify-end gap-3">
          {request.status === 'PENDING' && (
            <Button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Start Work
            </Button>
          )}
          {(request.status === 'PENDING' || request.status === 'IN_PROGRESS') && (
            <Button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          )}
        </div>

        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl p-0">
              <div className="relative aspect-square">
                <Image
                  src={selectedImage}
                  alt="Full size maintenance request image"
                  fill
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
} 
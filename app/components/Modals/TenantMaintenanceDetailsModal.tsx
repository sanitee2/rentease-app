'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Calendar, AlertTriangle, ImageIcon, ZoomIn, Home } from "lucide-react";
import { STATUS_STYLES, PRIORITY_STYLES } from '@/app/constants/maintenance';
import { MaintenanceRequest } from '@/app/types';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

interface TenantMaintenanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Partial<MaintenanceRequest>;
  setSelectedRequest: (request: Partial<MaintenanceRequest> | null) => void;
}

export default function TenantMaintenanceDetailsModal({
  isOpen,
  onClose,
  request,
  setSelectedRequest
}: TenantMaintenanceDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelRequest = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/maintenance/${request.id}`, { status: 'CANCELLED' });
      toast.success('Maintenance request cancelled');
      onClose();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-indigo-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Maintenance Request Details
          </DialogTitle>
          <DialogDescription>Maintenance Request Details</DialogDescription>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
            Submitted on {request.createdAt ? format(new Date(request.createdAt), 'MMMM d, yyyy') : 'N/A'}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Title and Priority */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{request.title}</h3>
              {request.priority && (
                <Badge 
                  variant="outline" 
                  className={`capitalize ${PRIORITY_STYLES[request.priority].badge}`}
                >
                  {request.priority.toLowerCase()} Priority
                </Badge>
              )}
            </div>

            {/* Property Details */}
            {request.listing && (
              <div className="bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Home className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-900">Property Details</h3>
                </div>
                <p className="text-gray-600 ml-8">{request.listing.title}</p>
              </div>
            )}

            {/* Description */}
            <div className="bg-indigo-50/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium text-gray-900">Issue Description</h3>
              </div>
              <p className="text-gray-600 ml-8">{request.description}</p>
            </div>

            {/* Images */}
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
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`Maintenance request image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {request.status === 'PENDING' && (
          <div className="px-6 py-4 border-t border-indigo-100 bg-indigo-50/50 flex justify-end">
            <Button
              onClick={handleCancelRequest}
              disabled={isLoading}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Request
            </Button>
          </div>
        )}

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
'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenancePriority, MaintenanceStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import axios from "axios";
import PaymentProofUpload from '@/app/components/inputs/PaymentProofUpload';
import { Textarea } from "@/components/ui/textarea";

interface MaintenanceRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId?: string;
  roomId?: string;
  listing?: {
    title: string;
    description: string;
  };
  room?: {
    title: string;
  } | null;
}

export default function MaintenanceRequestDialog({
  isOpen,
  onClose,
  listingId,
  roomId,
  listing,
  room
}: MaintenanceRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("MEDIUM");
  const [images, setImages] = useState<string[]>([]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      if (!listingId) {
        toast.error("Missing required listing information");
        return;
      }

      setIsLoading(true);

      if (!title || !description) {
        toast.error("Please fill in all required fields");
        return;
      }

      const maintenanceData = {
        title,
        description,
        priority,
        images: images,
        listingId,
        roomId,
        status: MaintenanceStatus.PENDING,
      };

      await axios.post('/api/maintenance', maintenanceData);
      
      toast.success('Maintenance request submitted successfully');
      onClose();
    } catch (error) {
      console.error('Maintenance request submission error:', error);
      toast.error('Failed to submit maintenance request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[49]"
          onClick={(e) => e.stopPropagation()}
          aria-hidden="true"
        />
      )}
      
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            document.body.style.overflow = 'unset';
            onClose();
          }
        }}
        modal={false}
      >
        <DialogContent 
          className="sm:max-w-[425px] w-full h-full sm:h-auto z-[50] border-indigo-100 p-0 gap-0 rounded-none sm:rounded-lg"
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader className="border-b border-indigo-50 p-4 sm:p-6">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Submit Maintenance Request
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Submit your maintenance request details
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="grid gap-4">
              <div className="bg-indigo-50/50 p-3 rounded-lg">
                <h3 className="font-medium text-sm text-gray-900">Property Details</h3>
                <p className="text-sm text-gray-600 mt-1">{listing?.title}</p>
                {room && (
                  <p className="text-sm text-gray-500 mt-1">Room: {room.title}</p>
                )}
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-900">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title of the issue"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Description */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-900">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the maintenance issue"
                    disabled={isLoading}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Priority */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-900">Priority Level</label>
                  <Select
                    value={priority}
                    onValueChange={(value: MaintenancePriority) => setPriority(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Priority</SelectItem>
                      <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                      <SelectItem value="HIGH">High Priority</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Images */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-900">Images</label>
                  <PaymentProofUpload
                    value={images}
                    onChange={(value) => setImages(value)}
                  />
                  <p className="text-xs text-gray-500">
                    Upload images of the maintenance issue
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-indigo-50 p-4 sm:p-6 mt-auto">
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isLoading}
                className="w-full sm:w-auto border-indigo-200 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
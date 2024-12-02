'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar, Receipt, Home, ZoomIn } from "lucide-react";
import { PaymentStatus, PaymentMode } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  paymentMethod: PaymentMode;
  description?: string;
  image?: string;
  periodStart?: Date;
  periodEnd?: Date;
  listing?: {
    id: string;
    title: string;
  };
}

interface TenantPaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  setSelectedPayment: (payment: Payment | null) => void;
}

export default function TenantPaymentDetailsModal({
  isOpen,
  onClose,
  payment,
  setSelectedPayment
}: TenantPaymentDetailsModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleCancelPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${payment.id}/cancel`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      toast.success('Payment cancelled successfully');
      
      if (pathname && pathname.includes('/dashboard')) {
        router.refresh();
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to cancel payment. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-indigo-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Payment Details
          </DialogTitle>
          <DialogDescription>Payment Details</DialogDescription>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            Submitted on {format(new Date(payment.createdAt), 'MMMM d, yyyy')}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Amount and Method */}
            <div className="bg-indigo-50/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₱{payment.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-base font-medium text-gray-900">
                    {payment.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Period if available */}
            {payment.periodStart && payment.periodEnd && (
              <div className="bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-900">Payment Period</h3>
                </div>
                <p className="text-gray-600 ml-8">
                  {format(new Date(payment.periodStart), 'MMMM d')} - {format(new Date(payment.periodEnd), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Property Details */}
            {payment.listing && (
              <div className="bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Home className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-900">Property Details</h3>
                </div>
                <p className="text-gray-600 ml-8">{payment.listing.title}</p>
              </div>
            )}

            {/* Description if available */}
            {payment.description && (
              <div className="bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Receipt className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-900">Payment Description</h3>
                </div>
                <p className="text-gray-600 ml-8">{payment.description}</p>
              </div>
            )}

            {/* Payment Proof if available */}
            {payment.image && (
              <div className="bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Receipt className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-900">Payment Proof</h3>
                </div>
                <div 
                  className="relative h-[200px] ml-8 rounded-lg overflow-hidden border border-indigo-100 cursor-pointer group"
                  onClick={() => setSelectedImage(payment.image || '')}
                >
                  <Image
                    src={payment.image}
                    alt="Payment proof"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add footer with cancel button */}
        {payment.status === 'PENDING' && (
          <div className="px-6 py-4 border-t border-indigo-100 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(payment.status)}`}>
                  {payment.status}
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleCancelPayment}
                className="ml-auto"
              >
                Cancel Payment
              </Button>
            </div>
          </div>
        )}

        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl p-0">
              <div className="relative aspect-square">
                <Image
                  src={selectedImage}
                  alt="Full size payment proof"
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
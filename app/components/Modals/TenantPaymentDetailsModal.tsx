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
      <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col bg-white">
        {/* Header */}
        <DialogHeader className="px-6 py-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Payment Details
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {format(new Date(payment.createdAt), 'MMMM d, yyyy')}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(payment.status)}`}>
              {payment.status}
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Amount Card - Make it stand out */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Amount Paid</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₱{payment.amount.toLocaleString()}
                  </p>
                </div>
                <div className="border-l pl-8">
                  <p className="text-sm font-medium text-gray-500 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-gray-900">
                      {payment.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 pb-6">
            <div className="grid gap-4">
              {/* Payment Period */}
              {payment.periodStart && payment.periodEnd && (
                <div className="bg-white rounded-xl p-5 shadow-sm border hover:border-indigo-200 transition-colors">
                  <div className="flex gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Payment Period</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(payment.periodStart), 'MMMM d')} - {format(new Date(payment.periodEnd), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Details */}
              {payment.listing && (
                <div className="bg-white rounded-xl p-5 shadow-sm border hover:border-indigo-200 transition-colors">
                  <div className="flex gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                      <Home className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Property</h3>
                      <p className="text-sm text-gray-600">{payment.listing.title}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {payment.description && (
                <div className="bg-white rounded-xl p-5 shadow-sm border hover:border-indigo-200 transition-colors">
                  <div className="flex gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                      <Receipt className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                      <p className="text-sm text-gray-600">{payment.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {payment.image && (
                <div className="bg-white rounded-xl p-5 shadow-sm border hover:border-indigo-200 transition-colors">
                  <div className="flex gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                      <Receipt className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Payment Proof</h3>
                      <p className="text-sm text-gray-600">Click to view full image</p>
                    </div>
                  </div>
                  <div 
                    className="relative h-[250px] rounded-xl overflow-hidden cursor-pointer group border border-gray-100"
                    onClick={() => setSelectedImage(payment.image || '')}
                  >
                    <Image
                      src={payment.image}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {payment.status === 'PENDING' && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleCancelPayment}
                className="px-6"
              >
                Cancel Payment
              </Button>
            </div>
          </div>
        )}

        {/* Image Preview */}
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
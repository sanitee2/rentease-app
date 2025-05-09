'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { PaymentStatus, PaymentMode } from "@prisma/client";

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
  declineReason?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCancelPayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payments/${payment.id}/cancel`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      toast.success('Payment cancelled successfully');
      router.refresh();
      onClose();
    } catch (error) {
      toast.error('Failed to cancel payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-2 bg-white">
          <DialogTitle className="text-xl">Payment Details</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-600 font-medium">
              {format(new Date(payment.createdAt), 'MMMM d, yyyy')}
            </p>
            <Badge variant={
              payment.status === 'PENDING' ? 'secondary' : 
              payment.status === 'COMPLETED' ? 'default' : 
              payment.status === 'FAILED' ? 'destructive' : 'secondary'
            }>
              {payment.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-2 space-y-6">
            {/* Payment Info */}
            <div className="flex items-center justify-between">
              <Badge variant="outline">Via {payment.paymentMethod}</Badge>
              <div className="text-right">
                <p className="text-2xl font-semibold">₱{payment.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(payment.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Payment Period */}
            {(payment.periodStart || payment.periodEnd) && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Payment Period</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">
                      {payment.periodStart ? format(new Date(payment.periodStart), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium">
                      {payment.periodEnd ? format(new Date(payment.periodEnd), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Property Details */}
            {payment.listing && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Property Details</h3>
                <p className="font-medium">{payment.listing.title}</p>
              </div>
            )}

            {/* Description */}
            {payment.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {payment.description}
                </p>
              </div>
            )}

            {/* Proof of Payment - Updated size */}
            {payment.image && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Proof of Payment</h3>
                <div className="relative w-full max-w-[300px] mx-auto aspect-[3/4] overflow-hidden rounded-lg bg-gray-50 cursor-pointer hover:opacity-90 transition">
                  <Image
                    src={payment.image}
                    alt="Payment proof"
                    fill
                    className="object-contain"
                    onClick={() => payment.image && setSelectedImage(payment.image)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer for Cancel Button */}
        {payment.status === 'PENDING' && (
          <div className="p-6 pt-0 bg-white border-t">
            <Button
              variant="destructive"
              onClick={handleCancelPayment}
              disabled={isLoading}
              className="w-full"
            >
              Cancel Payment
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Image Preview Dialog - Made larger */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-0">
            <div className="relative aspect-[3/4] w-full">
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
    </Dialog>
  );
} 
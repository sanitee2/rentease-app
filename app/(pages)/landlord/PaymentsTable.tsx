'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Payment, PaymentStatus } from '@prisma/client';
import { Eye, ZoomIn, X } from "lucide-react";
import Avatar from '@/app/components/Avatar';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { DynamicFullScreenGallery } from '@/app/components/dynamic';
import { toast } from "react-hot-toast";
import axios from "axios";
import { sendPaymentNotification } from '@/app/notifications/actions/sendPaymentNotification';
import { useSession } from "next-auth/react";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface PaymentsTableProps {
  data: (Payment & {
    user: {
      firstName: string;
      lastName: string;
      email: string | null;
      phoneNumber: string | null;
      image: string | null;
    };
    lease: {
      rentAmount: number;
      listing: {
        title: string;
        user: {
          firstName: string;
          lastName: string;
        };
      };
      room?: {
        title: string;
      } | null;
    };
    isPartial?: boolean;
  })[];
  onPaymentUpdate?: (updatedPayment: any) => void;
  itemsPerPage?: number;
}

export default function PaymentsTable({ 
  data, 
  onPaymentUpdate,
  itemsPerPage = 5
}: PaymentsTableProps) {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<(typeof data)[0] | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [tempPayment, setTempPayment] = useState<(typeof data)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Calculate pagination values
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Calculate empty rows needed to maintain consistent table height
  const emptyRows = Math.max(0, itemsPerPage - currentData.length);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleImageClick = (payment: typeof selectedPayment) => {
    setTempPayment(payment); // Store payment temporarily
    setSelectedPayment(null); // Close dialog
    setTimeout(() => {
      setShowGallery(true); // Open gallery after dialog closes
    }, 300); // Match dialog close animation duration
  };

  const handleGalleryClose = () => {
    setShowGallery(false);
    setTimeout(() => {
      setSelectedPayment(tempPayment); // Reopen dialog with stored payment
      setTempPayment(null);
    }, 300); // Match gallery close animation duration
  };

  const handlePaymentAction = async (action: PaymentStatus) => {
    if (!selectedPayment) return;

    if (action === 'FAILED' && !declineReason) {
      setShowDeclineDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      toast.loading(action === 'COMPLETED' ? 'Approving payment...' : 'Declining payment...');

      const response = await axios.patch(`/api/payments/${selectedPayment.id}`, {
        status: action,
        leaseId: selectedPayment.leaseId,
        amount: selectedPayment.amount,
        declineReason: action === 'FAILED' ? declineReason : undefined
      });

      if (action === 'COMPLETED') {
        const notificationResult = await sendPaymentNotification({
          email: selectedPayment.user.email,
          phone: selectedPayment.user.phoneNumber,
          name: `${selectedPayment.user.firstName} ${selectedPayment.user.lastName}`,
          amount: selectedPayment.amount.toLocaleString(),
          propertyName: selectedPayment.lease.listing.title,
          // Add null check for user data
          landlordName: selectedPayment.lease.listing.user 
            ? `${selectedPayment.lease.listing.user.firstName} ${selectedPayment.lease.listing.user.lastName}`
            : 'Landlord',
          periodStart: selectedPayment.periodStart 
            ? format(new Date(selectedPayment.periodStart), 'MMM d, yyyy')
            : undefined,
          periodEnd: selectedPayment.periodEnd
            ? format(new Date(selectedPayment.periodEnd), 'MMM d, yyyy')
            : undefined,
        });

        console.log('Notification result:', notificationResult);
      }

      if (onPaymentUpdate) {
        onPaymentUpdate(response.data);
      }

      toast.dismiss();
      toast.success(action === 'COMPLETED' ? 'Payment approved successfully' : 'Payment declined');
      setSelectedPayment(null);
      setDeclineReason('');

    } catch (error) {
      console.error('Payment action error:', error);
      toast.dismiss();
      toast.error('Failed to update payment status');
    } finally {
      setIsLoading(false);
      setShowDeclineDialog(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar src={payment.user.image} />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.user.firstName} {payment.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.lease.listing.title}
                    </div>
                    {payment.lease.room && (
                      <div className="text-sm text-gray-500">
                        Room: {payment.lease.room.title}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₱{payment.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.periodStart && payment.periodEnd ? (
                    <div className="flex flex-col">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">From: {format(new Date(payment.periodStart), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-gray-500">To: {format(new Date(payment.periodEnd), 'MMM d, yyyy')}</span>
                      </div>
                      {payment.isPartial && (
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full inline-flex items-center mt-1 w-fit">
                          Partial
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className="capitalize">
                    {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPayment(payment)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {/* Add empty rows to maintain height */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className="h-[73px] bg-gray-50/50">
                <td colSpan={8} className="px-6 py-4 whitespace-nowrap border-b border-gray-100" />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="px-6 py-4 flex items-center justify-center space-x-2 border-t border-gray-200">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${
              currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            &lt;
          </button>
          
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-4 py-2 rounded-full ${
                  currentPage === pageNumber
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${
              currentPage === totalPages 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            &gt;
          </button>
        </div>
      </div>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 max-h-[85vh] flex flex-col">
          {selectedPayment && (
            <>
              {/* Header Section - Fixed */}
              <div className="p-6 border-b border-gray-100 bg-white">
                <DialogTitle className="text-xl font-semibold mb-4">
                  Payment Details
                </DialogTitle>
                <div className="flex items-center gap-4">
                  <Avatar src={selectedPayment.user.image} />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedPayment.user.firstName} {selectedPayment.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedPayment.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Main Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Status and Amount Section */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${selectedPayment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedPayment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          selectedPayment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {selectedPayment.status}
                      </span>
                      <div>
                        <Badge variant="outline" className="capitalize">
                          via {selectedPayment.paymentMethod.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-gray-900">
                        ₱{selectedPayment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedPayment.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Payment Period */}
                  {(selectedPayment.periodStart || selectedPayment.periodEnd) ? (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Period</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">From</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedPayment.periodStart 
                              ? format(new Date(selectedPayment.periodStart), 'MMMM d, yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div>
                          <p className="text-sm text-gray-600">To</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedPayment.periodEnd
                              ? format(new Date(selectedPayment.periodEnd), 'MMMM d, yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500">Payment Period</h4>
                      <p className="text-sm text-gray-600 mt-1">No payment period specified</p>
                    </div>
                  )}

                  {/* Property Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Property Details</h4>
                    <p className="text-base font-medium text-gray-900">
                      {selectedPayment.lease.listing.title}
                    </p>
                    {selectedPayment.lease.room && (
                      <p className="text-sm text-gray-600 mt-1">
                        Room: {selectedPayment.lease.room.title}
                      </p>
                    )}
                  </div>

                  {/* Proof of Payment */}
                  {selectedPayment.image && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Proof of Payment</h4>
                      <div 
                        className="relative w-full h-[250px] rounded-lg overflow-hidden cursor-pointer group bg-gray-50"
                        onClick={() => handleImageClick(selectedPayment)}
                      >
                        <Image
                          src={selectedPayment.image}
                          alt="Proof of Payment"
                          fill
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white flex flex-col items-center gap-2">
                            <ZoomIn className="w-6 h-6" />
                            <span className="text-sm">Click to enlarge</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {selectedPayment.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {selectedPayment.description}
                      </p>
                    </div>
                  )}

                  {selectedPayment && (
                    <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 mt-auto">
                      <div className="flex gap-3 justify-end">
                        {selectedPayment.status === 'PENDING' && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isLoading}
                              onClick={() => handlePaymentAction('FAILED')}
                              className="text-red-600 hover:text-red-700"
                            >
                              {isLoading ? 'Processing...' : 'Decline'}
                            </Button>
                            <Button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handlePaymentAction('COMPLETED')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {isLoading ? 'Processing...' : 'Accept'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showGallery && tempPayment?.image && (
        <DynamicFullScreenGallery
          images={[tempPayment.image]}
          onClose={handleGalleryClose}
          initialIndex={0}
        />
      )}

      {/* Decline Reason Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={() => setShowDeclineDialog(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Decline Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this payment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-gray-200 p-3"
                placeholder="Enter reason for declining..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (declineReason.trim()) {
                  setShowDeclineDialog(false);
                  handlePaymentAction('FAILED');
                }
              }}
              disabled={!declineReason.trim()}
            >
              Decline Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
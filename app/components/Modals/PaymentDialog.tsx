'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMode } from "@prisma/client";
import { format, addMonths, isBefore } from "date-fns";
import { toast } from "react-hot-toast";
import axios from "axios";
import PaymentProofUpload from '@/app/components/inputs/PaymentProofUpload';
import { useRouter } from 'next/navigation';

interface PaymentPeriod {
  label: string;
  amount: number;
  months: number;
  startDate: Date;
  endDate: Date;
  isPartial?: boolean;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  leaseId?: string;
  listingId?: string;
  landlordId?: string;
  roomId?: string;
  rentAmount?: number;
  outstandingBalance?: number;
  monthlyDueDate?: number;
  listing?: {
    title: string;
    description: string;
  };
  room?: {
    title: string;
  } | null;
}

export default function PaymentDialog({
  isOpen,
  onClose,
  onSuccess,
  leaseId,
  rentAmount = 0,
  outstandingBalance = 0,
  monthlyDueDate = 1,
  listingId,
  landlordId,
  roomId,
  listing,
  room
}: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(rentAmount?.toString() || "");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("GCASH");
  const [proofImage, setProofImage] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod | null>(null);
  const [leaseDetails, setLeaseDetails] = useState<any>(null);
  const router = useRouter();

  // Fetch lease details when dialog opens
  useEffect(() => {
    const fetchLeaseDetails = async () => {
      if (isOpen && leaseId) {
        try {
          const response = await axios.get(`/api/payments/lease/${leaseId}`);
          setLeaseDetails(response.data);
        } catch (error) {
          console.error('Error fetching lease details:', error);
          toast.error('Failed to load payment information');
        }
      }
    };

    fetchLeaseDetails();
  }, [isOpen, leaseId]);

  // Add console.log to debug
  useEffect(() => {
    console.log('Lease Details:', leaseDetails);
  }, [leaseDetails]);

  // Calculate payment periods based on lease details
  const getPaymentPeriods = () => {
    if (!rentAmount || !monthlyDueDate || !leaseDetails?.lease) {
      return [];
    }

    const periods: PaymentPeriod[] = [];
    const leaseStartDate = new Date(leaseDetails.lease.startDate);
    const completedPayments = leaseDetails.payments || [];

    // Group payments by period to track partial payments
    const paymentsByPeriod = completedPayments.reduce((acc: any, payment: any) => {
      if (payment.periodStart && payment.periodEnd) {
        const periodKey = format(new Date(payment.periodStart), 'yyyy-MM');
        if (!acc[periodKey]) {
          acc[periodKey] = {
            totalPaid: 0,
            periodStart: new Date(payment.periodStart),
            periodEnd: new Date(payment.periodEnd)
          };
        }
        acc[periodKey].totalPaid += payment.amount;
      }
      return acc;
    }, {});

    // Find the latest paid period
    const latestPaidPeriod = Object.values(paymentsByPeriod)
      .sort((a: any, b: any) => b.periodEnd.getTime() - a.periodEnd.getTime())[0] as {
        periodEnd: Date;
      } | undefined;

    // Set current date to either the month after the latest paid period or lease start date
    let currentDate;
    if (latestPaidPeriod) {
      currentDate = new Date(latestPaidPeriod.periodEnd);
    } else {
      currentDate = new Date(leaseStartDate);
    }

    // Generate only the next period
    const periodStart = new Date(currentDate);
    const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, monthlyDueDate);
    const periodKey = format(periodStart, 'yyyy-MM');
    
    const existingPayments = paymentsByPeriod[periodKey];
    const expectedAmount = rentAmount;
    const paidAmount = existingPayments?.totalPaid || 0;
    const remainingAmount = Math.max(0, expectedAmount - paidAmount);

    // Add period if there's any remaining balance
    if (remainingAmount > 0) {
      periods.push({
        label: `${format(periodStart, 'MMMM d')} to ${format(periodEnd, 'MMMM d')} / ₱${remainingAmount.toLocaleString()}`,
        amount: remainingAmount,
        months: 1,
        startDate: periodStart,
        endDate: periodEnd,
        isPartial: paidAmount > 0
      });
    }

    return periods;
  };

  // Update payment amount when period changes
  const handlePeriodChange = (period: PaymentPeriod) => {
    setSelectedPeriod(period);
    // Don't automatically set the amount to allow for partial payments
    if (!paymentAmount) {
      setPaymentAmount(period.amount.toString());
    }
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    
    // Only update if it's a valid number and doesn't exceed the period amount
    if (!isNaN(numericValue) && (!selectedPeriod || numericValue <= selectedPeriod.amount)) {
      setPaymentAmount(value);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!leaseId || !listingId || !landlordId) {
        toast.error("Missing required lease information");
        return;
      }

      setIsLoading(true);

      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const amount = parseFloat(paymentAmount);
      const paymentData = {
        leaseId,
        listingId,
        landlordId,
        roomId,
        amount: parseFloat(paymentAmount),
        totalAmount: outstandingBalance || parseFloat(paymentAmount),
        mode: paymentMode,
        proofImage: proofImage[0],
        description,
        periodStart: selectedPeriod?.startDate,
        periodEnd: selectedPeriod?.endDate,
      };

      await axios.post('/api/payments', paymentData);
      
      toast.success('Payment submitted for approval');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
            // Prevent dialog from closing when interacting with Cloudinary widget
            event.preventDefault();
          }}
        >
          <DialogHeader className="border-b border-indigo-50 p-4 sm:p-6">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Submit Payment
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Submit your payment details for verification
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

              {/* Form fields with better mobile spacing */}
              <div className="space-y-5">
                {/* Payment Mode */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-900">Payment Mode</label>
                  <Select
                    value={paymentMode}
                    onValueChange={(value: PaymentMode) => setPaymentMode(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent className="z-[52]">
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="GCASH">GCash</SelectItem>
                      <SelectItem value="MAYA">Maya</SelectItem>
                      <SelectItem value="CHECK">Check</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-900">Amount</label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    disabled={isLoading}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">
                    Outstanding Balance: ₱{outstandingBalance?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className="grid gap-2 relative z-[51]">
                  <label className="text-sm font-medium">Payment Period</label>
                  <Select
                    value={selectedPeriod?.label || ""}
                    onValueChange={(value) => {
                      const period = getPaymentPeriods().find(p => p.label === value);
                      if (period) handlePeriodChange(period);
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment period (optional)" />
                    </SelectTrigger>
                    <SelectContent className="z-[52]">
                      {getPaymentPeriods().map((period) => (
                        <SelectItem 
                          key={period.label} 
                          value={period.label}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {period.label}
                            {period.isPartial && (
                              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                                Partial
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Rent payment for January 2024"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-900">Payment Proof</label>
                  <PaymentProofUpload
                    value={proofImage}
                    onChange={(value) => setProofImage(value)}
                  />
                  <p className="text-xs text-gray-500">
                    Upload a clear image of your payment receipt or proof
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
                {isLoading ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMode, PaymentStatus } from "@prisma/client";
import { format, addMonths, isBefore } from "date-fns";
import { toast } from "react-hot-toast";
import axios from "axios";
import PaymentProofUpload from '@/app/components/inputs/PaymentProofUpload';
import { useRouter } from 'next/navigation';
import { HiInformationCircle } from 'react-icons/hi2';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

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
  payments: {
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
  }[];
}

interface Payment {
  status: PaymentStatus;
  amount: number;
  periodStart?: Date | string;
  periodEnd?: Date | string;
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
  payments,
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
  const [showAmount, setShowAmount] = useState(false);

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
      console.log('Missing required data:', { rentAmount, monthlyDueDate, lease: leaseDetails?.lease });
      return [];
    }

    const periods: PaymentPeriod[] = [];
    const completedPayments = payments.filter(p => p.status === 'COMPLETED') || [];

    // Get the latest completed payment period
    const latestPayment = completedPayments
      .filter((payment) => payment.periodStart && payment.periodEnd)
      .sort((a, b) => 
        new Date(b.periodStart!).getTime() - new Date(a.periodStart!).getTime()
      )[0];

    if (!latestPayment) {
      // If no payments exist, start from lease start date
      const startDate = new Date(leaseDetails.lease.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      periods.push({
        label: `${format(startDate, 'MMMM d')} to ${format(endDate, 'MMMM d')} / ₱${rentAmount.toLocaleString()}`,
        amount: rentAmount,
        months: 1,
        startDate,
        endDate,
        isPartial: false
      });

      return periods;
    }

    // Calculate total payments for the current period
    const currentPeriodPayments = payments.filter(payment => 
      payment.status === 'COMPLETED' &&
      payment.periodStart &&
      payment.periodEnd &&
      format(new Date(payment.periodStart), 'yyyy-MM-dd') === format(new Date(latestPayment.periodStart!), 'yyyy-MM-dd') &&
      format(new Date(payment.periodEnd), 'yyyy-MM-dd') === format(new Date(latestPayment.periodEnd!), 'yyyy-MM-dd')
    );

    const totalPaid = currentPeriodPayments.reduce((sum, payment) => 
      sum + payment.amount, 0
    );

    const remainingBalance = rentAmount - totalPaid;

    // Add current period if there's remaining balance
    if (remainingBalance > 0) {
      periods.push({
        label: `${format(new Date(latestPayment.periodStart!), 'MMMM d')} to ${format(new Date(latestPayment.periodEnd!), 'MMMM d')} / ₱${remainingBalance.toLocaleString()}`,
        amount: remainingBalance,
        months: 1,
        startDate: new Date(latestPayment.periodStart!),
        endDate: new Date(latestPayment.periodEnd!),
        isPartial: totalPaid > 0
      });
    } else {
      // If current period is fully paid, show next period
      const nextPeriodStart = new Date(latestPayment.periodEnd!);
      const nextPeriodEnd = new Date(nextPeriodStart);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      // Check if there are any payments for the next period
      const nextPeriodPayments = payments.filter(payment => 
        payment.status === 'COMPLETED' &&
        payment.periodStart &&
        payment.periodEnd &&
        format(new Date(payment.periodStart), 'yyyy-MM-dd') === format(nextPeriodStart, 'yyyy-MM-dd') &&
        format(new Date(payment.periodEnd), 'yyyy-MM-dd') === format(nextPeriodEnd, 'yyyy-MM-dd')
      );

      const nextPeriodTotalPaid = nextPeriodPayments.reduce((sum, payment) => 
        sum + payment.amount, 0
      );

      const nextPeriodRemainingBalance = rentAmount - nextPeriodTotalPaid;

      periods.push({
        label: `${format(nextPeriodStart, 'MMMM d')} to ${format(nextPeriodEnd, 'MMMM d')} / ₱${nextPeriodRemainingBalance.toLocaleString()}`,
        amount: nextPeriodRemainingBalance,
        months: 1,
        startDate: nextPeriodStart,
        endDate: nextPeriodEnd,
        isPartial: nextPeriodTotalPaid > 0
      });
    }

    return periods;
  };

  // Update payment amount when period changes
  const handlePeriodChange = (period: PaymentPeriod) => {
    setSelectedPeriod(period);
    setShowAmount(true);
    // Set initial amount to the full remaining balance of the period
    setPaymentAmount(period.amount.toString());
  };

  // Update the handleAmountChange function
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    
    // Get the maximum allowed amount (either selected period amount or remaining balance)
    const maxAmount = selectedPeriod?.amount || outstandingBalance;
    
    // Only update if:
    // 1. It's a valid number
    // 2. It's not negative
    // 3. Doesn't exceed the maximum allowed amount
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= maxAmount) {
      setPaymentAmount(value);
    }
  };

  // Add a reset function
  const resetForm = () => {
    setPaymentAmount("");
    setPaymentMode("GCASH");
    setProofImage([]);
    setDescription("");
    setSelectedPeriod(null);
    setShowAmount(false);
  };

  // Update the handleSubmit function
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
      resetForm(); // Reset form after successful submission
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

  // Get the last completed payment's period end date for the message
  const lastPaymentEndDate = payments
    .filter((payment) => 
      payment.status === 'COMPLETED' && 
      payment.periodEnd
    )
    .sort((a, b) => 
      new Date(b.periodEnd!).getTime() - new Date(a.periodEnd!).getTime()
    )[0]?.periodEnd;

  // Calculate display balance and message
  const displayBalance = Math.max(0, outstandingBalance);
  const balanceMessage = outstandingBalance < 0 
    ? `Outstanding Balance: ₱${displayBalance.toLocaleString()}`
    : `Outstanding Balance: ₱${outstandingBalance.toLocaleString() || "0"}`;

  const tooltipMessage = lastPaymentEndDate
    ? `You are advance paid until ${format(new Date(lastPaymentEndDate), 'MMM d, yyyy')}`
    : 'Your previous payments cover future periods';

  // Inside the component, add this helper function
  const hasPendingPayment = (periodStart: Date, periodEnd: Date) => {
    return payments.some(payment => 
      payment.status === 'PENDING' &&
      payment.periodStart &&
      payment.periodEnd &&
      new Date(payment.periodStart).getTime() === periodStart.getTime() &&
      new Date(payment.periodEnd).getTime() === periodEnd.getTime()
    );
  };

  const getNextPaymentPeriod = () => {
    if (!payments || !monthlyDueDate) return null;

    // Sort payments by period start date
    const completedPayments = payments
      .filter(payment => 
        payment.status === 'COMPLETED' && 
        payment.periodStart &&
        payment.periodEnd
      )
      .sort((a, b) => 
        new Date(a.periodStart!).getTime() - new Date(b.periodStart!).getTime()
      );

    // Get the latest payment period
    const latestPayment = completedPayments[completedPayments.length - 1];

    // If there's no payment yet, start from current month's due date
    if (!latestPayment) {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), monthlyDueDate);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, monthlyDueDate);
      
      // If today is past this month's due date, move to next month
      if (today > startDate) {
        startDate.setMonth(startDate.getMonth() + 1);
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      return { start: startDate, end: endDate };
    }

    // Get the period of the latest payment
    const currentPeriodStart = new Date(latestPayment.periodStart!);
    const currentPeriodEnd = new Date(latestPayment.periodEnd!);

    // Calculate total payments for the current period
    const currentPeriodPayments = payments.filter(payment => 
      payment.status === 'COMPLETED' &&
      payment.periodStart &&
      new Date(payment.periodStart).getTime() === currentPeriodStart.getTime()
    );

    const totalPaidForPeriod = currentPeriodPayments.reduce((sum, payment) => 
      sum + payment.amount, 0
    );

    // If there's still remaining balance for the current period, return the same period
    if (totalPaidForPeriod < rentAmount!) {
      return {
        start: currentPeriodStart,
        end: currentPeriodEnd,
        remainingBalance: rentAmount! - totalPaidForPeriod
      };
    }

    // If current period is fully paid, move to next period
    const nextPeriodStart = new Date(currentPeriodEnd);
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    return { 
      start: nextPeriodStart, 
      end: nextPeriodEnd,
      remainingBalance: rentAmount
    };
  };

  const paymentPeriod = getNextPaymentPeriod();

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
            resetForm();
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

                {/* Payment Period - Moved before Amount */}
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
                      {getPaymentPeriods().length > 0 ? (
                        getPaymentPeriods().map((period) => (
                          <SelectItem 
                            key={period.label} 
                            value={period.label}
                            disabled={hasPendingPayment(period.startDate, period.endDate)}
                            className={`flex items-center justify-between ${
                              hasPendingPayment(period.startDate, period.endDate) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {period.label}
                              {period.isPartial && (
                                <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                                  Partial
                                </span>
                              )}
                              {hasPendingPayment(period.startDate, period.endDate) && (
                                <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded">
                                  Pending
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-periods" disabled>
                          No payment periods available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount - Only show after period is selected */}
                {showAmount && selectedPeriod && (
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-gray-900">Amount</label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      placeholder={`Enter amount (max: ₱${selectedPeriod.amount.toLocaleString()})`}
                      disabled={isLoading}
                      className="h-11"
                      min={0}
                      max={selectedPeriod.amount}
                      step="0.01"
                    />
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        Maximum amount: ₱{selectedPeriod.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Rent payment for January 2024"
                    disabled={isLoading}
                  />
                </div>

                {/* Payment Proof */}
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
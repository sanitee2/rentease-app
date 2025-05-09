'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Payment, PaymentMode } from "@prisma/client";
import { toast } from "react-hot-toast";
import PaymentProofUpload from '@/app/components/inputs/PaymentProofUpload';
import { fetchTenants, createLandlordPayment } from "@/app/actions/payments";
import type { TenantWithLease } from "@/app/actions/payments";
import { format } from "date-fns";

interface PaymentPeriod {
  label: string;
  amount: number;
  months: number;
  startDate: Date;
  endDate: Date;
  isPartial?: boolean;
}

interface LandlordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LandlordPaymentDialog({
  isOpen,
  onClose,
  onSuccess
}: LandlordPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [proofImage, setProofImage] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod | null>(null);
  const [showAmount, setShowAmount] = useState(false);

  // Add this helper function at the top level of the component
  const hasPendingPayment = (periodStart: Date, periodEnd: Date) => {
    return selectedLease?.Payment?.some((payment: Payment) => 
      payment.status === 'PENDING' &&
      payment.periodStart &&
      payment.periodEnd &&
      new Date(payment.periodStart).getTime() === periodStart.getTime() &&
      new Date(payment.periodEnd).getTime() === periodEnd.getTime()
    );
  };

  // Fetch tenants when dialog opens
  useEffect(() => {
    const loadTenants = async () => {
      if (isOpen) {
        try {
          const tenantsData = await fetchTenants();
          setTenants(tenantsData);
          
          // Reset selected tenant if there are no active tenants
          if (tenantsData.length === 0) {
            setSelectedTenant("");
            setSelectedLease(null);
          }
        } catch (error) {
          console.error('Error fetching tenants:', error);
          toast.error('Failed to load tenants');
        }
      }
    };

    loadTenants();
  }, [isOpen]);

  // Update selected lease when tenant is selected
  useEffect(() => {
    if (selectedTenant) {
      const tenant = tenants.find(t => t.id === selectedTenant);
      const activeLease = tenant?.activeLeases?.[0];
      
      if (activeLease) {
        setSelectedLease(activeLease);
        setPaymentAmount(activeLease.rentAmount.toString());
      } else {
        toast.error('No active lease found for this tenant');
        setSelectedLease(null);
        setPaymentAmount("");
      }
    }
  }, [selectedTenant, tenants]);

  // Replace the existing getPaymentPeriods function with this one
  const getPaymentPeriods = () => {
    if (!selectedLease?.rentAmount) {
      return [];
    }

    const rentAmount = selectedLease.rentAmount;
    const periods: PaymentPeriod[] = [];

    // Get completed payments for this lease
    const completedPayments = selectedLease.Payment?.filter((p: Payment) => p.status === 'COMPLETED') || [];

    // Sort payments by period start date
    const sortedPayments = completedPayments
      .filter((payment: Payment) => payment.periodStart && payment.periodEnd)
      .sort((a: Payment, b: Payment) => 
        new Date(a.periodStart!).getTime() - new Date(b.periodStart!).getTime()
      );

    // Get the latest payment period
    const latestPayment = sortedPayments[sortedPayments.length - 1];

    if (!latestPayment) {
      // If no payments exist, start from lease start date
      const startDate = new Date(selectedLease.startDate);
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

    // Get the period of the latest payment
    const currentPeriodStart = new Date(latestPayment.periodStart!);
    const currentPeriodEnd = new Date(latestPayment.periodEnd!);

    // Calculate total payments for the current period
    const currentPeriodPayments = selectedLease.Payment?.filter((payment: Payment) => 
      payment.status === 'COMPLETED' &&
      payment.periodStart &&
      new Date(payment.periodStart).getTime() === currentPeriodStart.getTime()
    ) || [];

    const totalPaidForPeriod = currentPeriodPayments.reduce((sum: number, payment: Payment) => 
      sum + payment.amount, 0
    );

    // If there's still remaining balance for the current period
    if (totalPaidForPeriod < rentAmount) {
      periods.push({
        label: `${format(currentPeriodStart, 'MMMM d')} to ${format(currentPeriodEnd, 'MMMM d')} / ₱${(rentAmount - totalPaidForPeriod).toLocaleString()}`,
        amount: rentAmount - totalPaidForPeriod,
        months: 1,
        startDate: currentPeriodStart,
        endDate: currentPeriodEnd,
        isPartial: totalPaidForPeriod > 0
      });
    } else {
      // If current period is fully paid, move to next period
      const nextPeriodStart = new Date(currentPeriodEnd);
      const nextPeriodEnd = new Date(nextPeriodStart);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      periods.push({
        label: `${format(nextPeriodStart, 'MMMM d')} to ${format(nextPeriodEnd, 'MMMM d')} / ₱${rentAmount.toLocaleString()}`,
        amount: rentAmount,
        months: 1,
        startDate: nextPeriodStart,
        endDate: nextPeriodEnd,
        isPartial: false
      });
    }

    return periods;
  };

  // Handle period selection
  const handlePeriodChange = (period: PaymentPeriod) => {
    setSelectedPeriod(period);
    setShowAmount(true);
    setPaymentAmount(period.amount.toString());
  };

  // Update handleSubmit to include period information
  const handleSubmit = async () => {
    try {
      if (!selectedLease) {
        toast.error("Please select a tenant");
        return;
      }

      setIsLoading(true);

      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const result = await createLandlordPayment({
        leaseId: selectedLease.id,
        listingId: selectedLease.listingId,
        landlordId: selectedLease.listing.userId,
        roomId: selectedLease.roomId,
        amount: parseFloat(paymentAmount),
        mode: paymentMode,
        proofImage: proofImage[0],
        description: description || `Rent payment for ${selectedPeriod?.startDate ? format(selectedPeriod.startDate, 'MMMM yyyy') : ''}`,
        status: 'COMPLETED',
        userId: tenants.find(t => t.id === selectedTenant)?.userId || '',
        periodStart: selectedPeriod?.startDate,
        periodEnd: selectedPeriod?.endDate,
      });

      if (result.success) {
        toast.success('Payment recorded successfully');
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        toast.error('Failed to record payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Update resetForm to include new state
  const resetForm = () => {
    setSelectedTenant("");
    setSelectedLease(null);
    setPaymentAmount("");
    setPaymentMode("CASH");
    setProofImage([]);
    setDescription("");
    setSelectedPeriod(null);
    setShowAmount(false);
  };

  return (
    <>
      {/* Add overlay */}
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
          className="sm:max-w-[425px] w-full h-full sm:h-auto z-[50] border-indigo-100 p-6 gap-0 rounded-none sm:rounded-lg"
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader className="border-b border-indigo-50 pb-4">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Record Payment
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Record an in-person payment from a tenant
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Tenant</label>
              {tenants.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                  No active tenants found. Tenants must have an active lease to record payments.
                </div>
              ) : (
                <Select
                  value={selectedTenant}
                  onValueChange={setSelectedTenant}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.user.firstName} {tenant.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedLease && (
              <>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Property</label>
                  <Input
                    value={selectedLease.listing.title}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Payment Mode</label>
                  <Select
                    value={paymentMode}
                    onValueChange={(value: PaymentMode) => setPaymentMode(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
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

                {/* Payment Period Selection */}
                <div className="grid gap-2">
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
                      <SelectValue placeholder="Select payment period" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPaymentPeriods().map((period) => (
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
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount - Only show after period is selected */}
                {showAmount && selectedPeriod && (
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= selectedPeriod.amount) {
                          setPaymentAmount(value);
                        }
                      }}
                      placeholder={`Enter amount (max: ₱${selectedPeriod.amount.toLocaleString()})`}
                      disabled={isLoading}
                      min={0}
                      max={selectedPeriod.amount}
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500">
                      Maximum amount: ₱{selectedPeriod.amount.toLocaleString()}
                    </p>
                  </div>
                )}

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
                  <label className="text-sm font-medium">Payment Proof (Optional)</label>
                  <PaymentProofUpload
                    value={proofImage}
                    onChange={(value) => setProofImage(value)}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedLease || tenants.length === 0}
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LuAlertCircle, LuCalendar, LuHome, LuDoorOpen, LuCalendarClock, LuWallet, LuScroll, LuReceipt} from "react-icons/lu";
import { FaFileContract } from "react-icons/fa6";
import { format } from 'date-fns';
import { toast } from "react-hot-toast";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LeaseStatus } from '@/app/types';
import { PaymentStatus } from '@prisma/client';

interface PendingLeaseAlertProps {
  lease: {
    id: string;
    status: LeaseStatus;
    rentAmount: number;
    startDate: Date;
    endDate?: Date | null;
    monthlyDueDate: number;
    outstandingBalance: number;
    leaseTerms: string;
    Payment: {
      id: string;
      amount: number;
      createdAt: Date;
      status: PaymentStatus;
    }[];
    listing: {
      id: string;
      title: string;
      description: string;
    };
    room?: {
      id: string;
      title: string;
    };
  };
}

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const PendingLeaseAlert: React.FC<PendingLeaseAlertProps> = ({ lease }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'accept' | 'decline') => {
    try {
      setIsLoading(true);
      
      await axios.patch(`/api/leases/${lease.id}`, {
        status: action === 'accept' ? 'ACTIVE' : 'REJECTED'
      });
      
      toast.success(
        action === 'accept' 
          ? 'Lease contract accepted! You can now proceed with payments.' 
          : 'Lease contract declined'
      );
      
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating lease:', error);
      toast.error('Something went wrong while updating the lease');
    } finally {
      setIsLoading(false);
    }
  };

  console.log(lease.room);

  return (
    <>
      <Alert className="mb-8 bg-gradient-to-r from-amber-50/80 to-amber-100/80 border border-amber-200/50 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <LuAlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <AlertTitle className="text-amber-800 font-medium">
                Pending Lease Contract
              </AlertTitle>
              <AlertDescription className="text-amber-600/90 text-sm mt-0.5">
                A new lease contract is waiting for your review
              </AlertDescription>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(true)}
            className="ml-4 bg-white hover:bg-amber-50 border-amber-200 text-amber-700 hover:text-amber-800 transition-colors"
          >
            Review Contract
          </Button>
        </div>
      </Alert>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FaFileContract className="h-5 w-5 text-indigo-600" />
              Lease Contract Details
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Please review all details carefully before making a decision
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Property Details */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <LuHome className="h-4 w-4 text-indigo-600" />
                Property Details
              </h3>
              <div className="pl-6 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{lease.listing.title}</p>
                  <div 
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: lease.listing.description }}
                  />
                </div>

                {lease.room && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm">
                      <span className="text-gray-500">Room:</span>{' '}
                      <span className="text-gray-900">{lease.room.title}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-gray-900">
                  <LuCalendar className="h-4 w-4 text-indigo-600" />
                  Start Date
                </div>
                <p className="pl-6 text-sm text-gray-600">
                  {format(new Date(lease.startDate), 'PPP')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-gray-900">
                  <LuCalendarClock className="h-4 w-4 text-indigo-600" />
                  Monthly Due Date
                </div>
                <p className="pl-6 text-sm text-gray-600">
                  {`Every ${lease.monthlyDueDate}${getOrdinalSuffix(lease.monthlyDueDate)} day of the month`}
                </p>
              </div>
            </div>

            {/* Monthly Rent */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-gray-900">
                <LuWallet className="h-4 w-4 text-indigo-600" />
                Monthly Rent
              </div>
              <p className="pl-6 text-sm text-gray-900 font-medium">
                ₱{lease.rentAmount.toLocaleString()}
              </p>
            </div>

            {/* Lease Terms */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-900">
                <LuScroll className="h-4 w-4 text-indigo-600" />
                Lease Terms
              </div>
              <div 
                className="pl-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
                dangerouslySetInnerHTML={{ __html: lease.leaseTerms }}
              />
            </div>

            {/* Payment History if any */}
            {lease.Payment && lease.Payment.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-900">
                  <LuReceipt className="h-4 w-4 text-indigo-600" />
                  Payment History
                </div>
                <div className="pl-6 space-y-2">
                  {lease.Payment.map((payment) => (
                    <div 
                      key={payment.id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ₱{payment.amount.toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        payment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-6">
            <Button
              variant="outline"
              onClick={() => handleAction('decline')}
              disabled={isLoading}
              className="border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              Decline
            </Button>
            <Button
              onClick={() => handleAction('accept')}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Accept Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingLeaseAlert; 
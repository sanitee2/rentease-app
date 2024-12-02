'use client';

import { format } from 'date-fns';
import { FaCalendar, FaHome, FaMoneyBill } from 'react-icons/fa';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import EmptyState from '@/app/(home)/dashboard/_components/EmptyState';
import { FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActiveLeaseProps {
  lease: {
    id: string;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'CANCELLED';
    rentAmount: number;
    startDate: Date;
    endDate?: Date;
    leaseTerms: string;
    listing?: {
      id: string;
      title: string;
      description: string;
    };
  } | null;
}

const ActiveLease: React.FC<ActiveLeaseProps> = ({ lease }) => {
  const router = useRouter();
  const [showFullTerms, setShowFullTerms] = useState(false);
  
  if (!lease) {
    return (
      <EmptyState 
        type="lease"
        subtitle="Start by applying for a lease or contact your property manager."
      />
    );
  }

  if (!lease || !lease.listing) {
    return (
      <div className="text-center py-8 text-gray-500">
        No active lease found.
      </div>
    );
  }

  // Function to truncate text and add "...see more"
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaHome className="text-blue-600 w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="font-medium">{lease.listing.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => router.push(`/listings/info/${lease.listing?.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaMoneyBill className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="font-medium">₱{lease.rentAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaCalendar className="text-purple-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease Period</p>
              <p className="font-medium">
                {format(new Date(lease.startDate), 'MMM d, yyyy')} - 
                {lease.endDate ? format(new Date(lease.endDate), 'MMM d, yyyy') : ' Ongoing'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Lease Terms</h3>
            <button
              onClick={() => setShowFullTerms(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Full Terms
            </button>
          </div>
          <div 
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ 
              __html: truncateText(lease.leaseTerms) 
            }} 
          />
        </div>
      </div>

      <Dialog open={showFullTerms} onOpenChange={setShowFullTerms}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0">
          <DialogHeader className="px-4 py-3 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Lease Terms 
            </DialogTitle>
            <p className="text-sm text-gray-500">
              For {lease.listing.title}
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-4">
              {/* Lease Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <h3 className="font-medium text-gray-900 text-sm">Lease Summary</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Monthly Rent</p>
                    <p className="font-medium">₱{lease.rentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lease Period</p>
                    <p className="font-medium">
                      {format(new Date(lease.startDate), 'MMM d, yyyy')} - 
                      {lease.endDate ? format(new Date(lease.endDate), 'MMM d, yyyy') : ' Ongoing'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Terms */}
              <div>
                <h3 className="font-medium text-gray-900 text-sm mb-2">Full Terms & Conditions</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-600 text-sm"
                  dangerouslySetInnerHTML={{ __html: lease.leaseTerms }}
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActiveLease; 
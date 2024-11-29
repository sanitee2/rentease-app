'use client';

import { format } from 'date-fns';
import { FaCalendar, FaHome, FaMoneyBill } from 'react-icons/fa';
import { useState } from 'react';
import Modal from '@/app/components/Modals/Modal';

interface ActiveLeaseProps {
  lease: {
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    terms: string;
  } | null;
  room: {
    title: string;
    description: string;
  } | null;
}

const ActiveLease: React.FC<ActiveLeaseProps> = ({ lease, room }) => {
  const [showFullTerms, setShowFullTerms] = useState(false);
  
  if (!lease || !room) {
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

  const termsModal = (
    <div 
      className="text-sm text-gray-600"
      dangerouslySetInnerHTML={{ __html: lease.terms }}
    />
  );

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaHome className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p className="font-medium">{room.title}</p>
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
                {format(new Date(lease.endDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Terms & Conditions</h3>
          <div className="text-sm text-gray-600">
            <div dangerouslySetInnerHTML={{ 
              __html: truncateText(lease.terms) 
            }} />
            <button
              onClick={() => setShowFullTerms(true)}
              className="text-blue-600 hover:text-blue-700 font-medium mt-1"
            >
              ...see more
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showFullTerms}
        onClose={() => setShowFullTerms(false)}
        title="Terms & Conditions"
        body={termsModal}
        size="md"
      />
    </>
  );
};

export default ActiveLease; 
import { format } from 'date-fns';
import { FaCalendar, FaHome, FaMoneyBill } from 'react-icons/fa';

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
  if (!lease || !room) {
    return (
      <div className="text-center py-8 text-gray-500">
        No active lease found.
      </div>
    );
  }

  return (
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
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {lease.terms}
        </p>
      </div>
    </div>
  );
};

export default ActiveLease; 
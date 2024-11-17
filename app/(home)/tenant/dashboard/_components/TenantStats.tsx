import { FaHome, FaMoneyBill, FaFileContract } from 'react-icons/fa';

interface TenantStatsProps {
  leases: any[];
  totalPaid: number;
  activeLeaseCount: number;
}

const TenantStats = ({ leases, totalPaid, activeLeaseCount }: TenantStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <FaFileContract className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Lease</p>
            <p className="text-2xl font-semibold">{activeLeaseCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <FaMoneyBill className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-semibold">₱{totalPaid.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FaHome className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Leases</p>
            <p className="text-2xl font-semibold">{leases.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantStats; 
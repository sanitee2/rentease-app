'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/Container';
import TenantStats from './TenantStats';
import ActiveLease from './ActiveLease';
import PaymentHistory from './PaymentHistory';
import MaintenanceRequests from './MaintenanceRequests';
import LoadingState from '../loading';
import axios from 'axios';
import { SafeUser } from '@/app/types';
import { FaTools, FaCreditCard, FaFileContract, FaBell } from 'react-icons/fa';

interface DashboardClientProps {
  currentUser: SafeUser | null;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    leases: [],
    payments: [],
    maintenanceRequests: [],
    currentLease: null,
    currentRoom: null,
    totalPaid: 0,
    activeLeaseCount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/tenant/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Container>
      <div className="py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-gray-500 mt-2">
              Manage your lease, payments, and maintenance requests
            </p>
          </div>
          <button className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition">
            <FaBell className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <TenantStats 
              leases={data.leases}
              totalPaid={data.totalPaid}
              activeLeaseCount={data.activeLeaseCount}
            />
            
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Active Lease</h2>
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <ActiveLease lease={data.currentLease} room={data.currentRoom} />
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition">
                  View All
                </button>
              </div>
              <PaymentHistory payments={data.payments} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-md p-8 text-white">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center gap-3 backdrop-blur-sm">
                  <FaTools className="w-5 h-5" />
                  <span className="font-medium">Submit Maintenance Request</span>
                </button>
                <button className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center gap-3 backdrop-blur-sm">
                  <FaCreditCard className="w-5 h-5" />
                  <span className="font-medium">Make Payment</span>
                </button>
                <button className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center gap-3 backdrop-blur-sm">
                  <FaFileContract className="w-5 h-5" />
                  <span className="font-medium">View Lease Details</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Maintenance Requests</h2>
                <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition">
                  View All
                </button>
              </div>
              <MaintenanceRequests requests={data.maintenanceRequests} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DashboardClient; 
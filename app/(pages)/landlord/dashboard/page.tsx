import { Suspense } from 'react';
import LoadingState from '@/app/components/LoadingState';
import DashboardContent from './components/DashboardContent';
import RecentLeases from './components/RecentLeases';
import MaintenanceAlerts from './components/MaintenanceAlerts';
import UpcomingPayments from './components/UpcomingPayments';
import OccupancyChart from './components/OccupancyChart';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-2 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense fallback={<LoadingState />}>
          <DashboardContent />
        </Suspense>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Lease Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Lease Activity</h2>
            <Suspense fallback={<LoadingState />}>
              <RecentLeases />
            </Suspense>
          </div>

          {/* Urgent Maintenance Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Maintenance Alerts</h2>
            <Suspense fallback={<LoadingState />}>
              <MaintenanceAlerts />
            </Suspense>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payments Need Approval</h2>
            <Suspense fallback={<LoadingState />}>
              <UpcomingPayments />
            </Suspense>
          </div>

          {/* Occupancy Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Occupancy Trends</h2>
            <Suspense fallback={<LoadingState />}>
              <OccupancyChart />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

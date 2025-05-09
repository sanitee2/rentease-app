import { Suspense } from 'react';
import LoadingState from '@/app/components/LoadingState';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import MaintenanceTable from '../MaintenanceTable';
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export default async function MaintenancePage() {
  const currentUser = await getCurrentUser();

  // Get maintenance request counts
  const counts = await prisma.maintenanceRequest.groupBy({
    by: ['status'],
    where: {
      listing: {
        userId: currentUser?.id
      }
    },
    _count: {
      _all: true
    }
  });

  // Calculate totals
  const totalRequests = counts.reduce((acc, curr) => acc + curr._count._all, 0);
  const pendingRequests = counts.find(c => c.status === 'PENDING')?._count._all || 0;
  const completedRequests = counts.find(c => c.status === 'COMPLETED')?._count._all || 0;
  
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Maintenance Requests
            </h1>
          </div>
          <Breadcrumbs />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Requests</p>
            <p className="text-2xl font-semibold">{totalRequests}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending Requests</p>
            <p className="text-2xl font-semibold">{pendingRequests}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Completed Requests</p>
            <p className="text-2xl font-semibold">{completedRequests}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Maintenance History</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage maintenance requests from tenants
            </p>
          </div>
          <MaintenanceTable />
        </div>
      </div>
    </div>
  );
} 
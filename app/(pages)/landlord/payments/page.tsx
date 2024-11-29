import React from 'react';
import PaymentsTable from '../PaymentsTable';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserPayments from '@/app/actions/getUserPayments';
import { redirect } from 'next/navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import LoadingState from '@/app/components/LoadingState';

function Loading() {
  return <LoadingState />;
}

const Payments = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return redirect('/');
  }
  
  const payments = await getUserPayments(currentUser.id);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Payments
            </h1>
          </div>
          <Breadcrumbs />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Payments</p>
            <p className="text-2xl font-semibold">{payments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Completed Payments</p>
            <p className="text-2xl font-semibold">
              {payments.filter(p => p.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
            <p className="text-2xl font-semibold">
              {payments.filter(p => p.status === 'PENDING').length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your payment transactions
            </p>
          </div>
          <PaymentsTable data={payments} />
        </div>
      </div>
    </div>
  );
};

export default Payments; 
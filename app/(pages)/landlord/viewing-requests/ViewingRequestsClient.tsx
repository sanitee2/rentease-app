'use client';

import { SafeUser } from "@/app/types";
import ViewingRequestsTable from "./ViewingRequestsTable";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface ViewingRequestsClientProps {
  currentUser: SafeUser | null;
  initialRequests: any[];
}

const ViewingRequestsClient: React.FC<ViewingRequestsClientProps> = ({
  currentUser,
  initialRequests
}) => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Viewing Requests
          </h1>
          <Breadcrumbs />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Requests</p>
            <p className="text-2xl font-semibold">{initialRequests.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-semibold">
              {initialRequests.filter(req => req.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Approved</p>
            <p className="text-2xl font-semibold">
              {initialRequests.filter(req => req.status === 'APPROVED').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Declined</p>
            <p className="text-2xl font-semibold">
              {initialRequests.filter(req => req.status === 'DECLINED').length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Viewing Request History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track property viewing requests
            </p>
          </div>

          <ViewingRequestsTable 
            currentData={initialRequests}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewingRequestsClient; 
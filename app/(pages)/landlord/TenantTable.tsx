'use client';

import { TenantData } from '@/app/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import TenantDetailsModal from "@/app/components/Modals/TenantDetailsModal";
import { useState } from "react";

interface TenantTableProps {
  currentData: TenantData[];
  onRemoveTenant: (tenantId: string) => Promise<void>;
}

const TenantTable = ({ 
  currentData, 
  onRemoveTenant
}: TenantTableProps) => {
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);

  // Filter to only show active and pending leases
  const filteredData = currentData.filter(tenant => {
    const recentLease = tenant.leaseContracts?.[0];
    return recentLease?.status === 'ACTIVE' || recentLease?.status === 'PENDING';
  });

  // Helper function to get the most recent lease
  const getMostRecentLease = (tenant: TenantData) => {
    if (!tenant.leaseContracts?.length) return null;
    
    return [...tenant.leaseContracts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  // Calculate empty rows needed
  const emptyRows = Math.max(0, 5 - filteredData.length);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lease Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lease Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Financial Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((tenant) => {
              const activeLease = getMostRecentLease(tenant);
              
              return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={tenant.image || '/images/placeholder.jpg'}
                        alt={`${tenant.firstName} ${tenant.lastName}`}
                        width={40}
                        height={40}
                      />
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeLease?.listing?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeLease?.room?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${activeLease?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        activeLease?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        activeLease?.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        activeLease?.status === 'CANCELLED' ? 'bg-orange-100 text-orange-800' :
                        activeLease?.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {activeLease?.status || 'INACTIVE'}
                    </span>
                    
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeLease && (
                      <div className="flex flex-col">
                        <span>From: {format(new Date(activeLease.startDate), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-gray-500">
                          Due every: {activeLease.monthlyDueDate}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`text-sm ${(activeLease?.outstandingBalance ?? 0) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        Outstanding: ₱{activeLease?.outstandingBalance?.toLocaleString() ?? '0'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Monthly Rent: ₱{activeLease?.rentAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTenant(tenant)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {/* Add empty rows to maintain height */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className="bg-gray-50/50">
                <td colSpan={7} className="px-6 py-4 h-[73px] border-b border-gray-100"></td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tenants to display
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 flex items-center justify-center space-x-2 border-t border-gray-200">
          <button className="p-2 rounded-full hover:bg-gray-50">&lt;</button>
          <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-700">1</button>
          <button className="p-2 rounded-full hover:bg-gray-50">&gt;</button>
        </div>
      </div>

      {selectedTenant && (
        <TenantDetailsModal
          isOpen={!!selectedTenant}
          onClose={() => setSelectedTenant(null)}
          tenant={selectedTenant}
        />
      )}
    </>
  );
};

export default TenantTable;

'use client';

import { TenantData } from '@/app/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeaseDetailsModal from "@/app/components/Modals/LeaseDetailsModal";
import { useState, useMemo } from "react";
import { LeaseStatus } from '@prisma/client';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LeaseHistoryTableProps {
  currentData: TenantData[];
}

const ITEMS_PER_PAGE = 5;

const FILTER_BADGES: Array<{
  value: LeaseStatus | 'all';
  label: string;
  color: string;
}> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'orange' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' }
];

const LeaseHistoryTable = ({ currentData }: LeaseHistoryTableProps) => {
  const [selectedLease, setSelectedLease] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Flatten and filter lease contracts
  const filteredLeaseContracts = useMemo(() => {
    let contracts = currentData.flatMap(tenant => 
      tenant.leaseContracts
        .filter(lease => 
          lease.status !== 'ACTIVE' && lease.status !== 'PENDING'
        )
        .map(lease => ({
          ...lease,
          tenant: {
            id: tenant.id,
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            email: tenant.email,
            image: tenant.image
          }
        }))
    );

    // Apply search filter
    if (searchQuery) {
      contracts = contracts.filter(lease => 
        lease.tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.listing?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      contracts = contracts.filter(lease => lease.status === statusFilter);
    }

    // Sort by most recent first
    return contracts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [currentData, searchQuery, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeaseContracts.length / ITEMS_PER_PAGE);
  const paginatedLeases = filteredLeaseContracts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate empty rows needed
  const emptyRows = Math.max(0, 5 - paginatedLeases.length);

  return (
    <>
      {/* Search and Filter Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search leases..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex gap-2">
            {FILTER_BADGES.map((badge) => (
              <button
                key={badge.value}
                onClick={() => {
                  setStatusFilter(badge.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === badge.value 
                    ? `bg-${badge.color}-100 text-${badge.color}-800` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {badge.label}
                {badge.value !== 'all' && (
                  <span className="ml-1">
                    {filteredLeaseContracts.filter(lease => lease.status === badge.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
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
            {paginatedLeases.map((lease) => (
              <tr key={`${lease.id}-${lease.tenant.id}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Image
                      className="h-10 w-10 rounded-full object-cover"
                      src={lease.tenant.image || '/images/placeholder.jpg'}
                      alt={`${lease.tenant.firstName} ${lease.tenant.lastName}`}
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lease.tenant.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lease.listing?.title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lease.room?.title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${lease.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      lease.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      lease.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      lease.status === 'CANCELLED' ? 'bg-orange-100 text-orange-800' :
                      lease.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {lease.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>From: {format(new Date(lease.startDate), 'MMM d, yyyy')}</span>
                    {lease.endDate && (
                      <span>To: {format(new Date(lease.endDate), 'MMM d, yyyy')}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      Due every: {lease.monthlyDueDate}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`text-sm ${(lease.outstandingBalance ?? 0) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      Outstanding: ₱{lease.outstandingBalance?.toLocaleString() ?? '0'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Monthly Rent: ₱{lease.rentAmount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedLease(lease)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {/* Add empty rows to maintain height */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${currentPage}-${index}`} className="bg-gray-50/50">
                <td colSpan={7} className="px-6 py-4 h-[73px] border-b border-gray-100"></td>
              </tr>
            ))}
            {paginatedLeases.length === 0 && (
              <tr key="no-data">
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No lease history to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeaseContracts.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{filteredLeaseContracts.length}</span>
                {' '}results
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedLease && (
        <LeaseDetailsModal
          isOpen={!!selectedLease}
          onClose={() => setSelectedLease(null)}
          lease={selectedLease}
        />
      )}
    </>
  );
};

export default LeaseHistoryTable; 
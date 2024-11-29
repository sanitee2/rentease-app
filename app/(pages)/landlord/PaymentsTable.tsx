'use client';

import { PaymentStatus } from "@prisma/client";
import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { formatPrice } from '@/app/libs/utils';
import { format } from 'date-fns';

interface PaymentTableProps {
  data: any[];
}

const ITEMS_PER_PAGE = 5;

type FilterValue = PaymentStatus | 'all';

const FILTER_BADGES: Array<{
  value: FilterValue;
  label: string;
  color: string;
}> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'PENDING', label: 'Pending', color: 'orange' },
  { value: 'FAILED', label: 'Failed', color: 'red' },
];

const PaymentsTable: React.FC<PaymentTableProps> = ({ data }) => {
  const [payments, setPayments] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');

  useEffect(() => {
    let filtered = [...payments];

    if (searchQuery) {
      filtered = filtered.filter((payment) => {
        const searchString = [
          payment.lease.listing.title,
          payment.lease.listing.street,
          payment.lease.listing.barangay,
          payment.user.firstName,
          payment.user.lastName,
          payment.user.email,
        ].join(' ').toLowerCase();
        
        return searchString.includes(searchQuery.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [payments, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);
  const emptyRowsCount = ITEMS_PER_PAGE - currentData.length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search by property or tenant..."
          />
          <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
            <svg className="size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {FILTER_BADGES.map((badge) => (
            <button
              key={badge.value}
              onClick={() => setStatusFilter(badge.value)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${statusFilter === badge.value
                  ? `bg-${badge.color}-100 text-${badge.color}-700 ring-2 ring-${badge.color}-600`
                  : `bg-${badge.color}-50 text-${badge.color}-600 hover:bg-${badge.color}-100`
                }
                transition-colors
              `}
            >
              {badge.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{payment.lease.listing.title}</div>
                  <div className="text-gray-500 text-xs">
                    {payment.lease.listing.street}, {payment.lease.listing.barangay}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {payment.user.firstName} {payment.user.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>{payment.user.email}</div>
                  {payment.user.phoneNumber && (
                    <div className="text-gray-500 text-xs">{payment.user.phoneNumber}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatPrice(payment.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {format(new Date(payment.date), 'PPP')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
            {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-16">
                <td colSpan={6}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="py-4 px-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{' '}
            {filteredData.length} payments
          </p>
          <nav className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 inline-flex items-center rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span aria-hidden="true">«</span>
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2.5 text-sm rounded-full ${
                  currentPage === index + 1 ? 'bg-gray-100' : ''
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="p-2 inline-flex items-center rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span aria-hidden="true">»</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTable; 
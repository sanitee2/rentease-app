'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SafeUser, SafeListing, TenantData } from '@/app/types';
import axios from 'axios';
import Select from 'react-select';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TenantTableProps {
  currentUserId: string | undefined;
  tenants: TenantData[];
  listings: SafeListing[];
  isLoading?: boolean;
  onViewDetails: (tenant: TenantData) => void;
  onRemoveTenant: (tenantId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 5;

interface ListingOption {
  value: 'all' | SafeListing;
  label: string;
}

type SortField = 'name' | 'email' | 'property' | 'room' | 'rent' | 'leaseStart';
type SortOrder = 'asc' | 'desc';

const formatFullName = (tenant: TenantData) => {
  const parts = [
    tenant.firstName,
    tenant.middleName ? `${tenant.middleName.charAt(0)}.` : '',
    tenant.lastName,
    tenant.suffix || ''
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' ') : '-';
};

const TenantTable: React.FC<TenantTableProps> = ({ 
  currentUserId, 
  tenants: initialTenants,
  listings: initialListings,
  isLoading = false,
  onViewDetails,
  onRemoveTenant
}) => {
  const [selectedListing, setSelectedListing] = useState<'all' | SafeListing>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<TenantData[]>(initialTenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    let filtered = initialTenants;

    if (selectedListing !== 'all') {
      filtered = filtered.filter(tenant =>
        tenant.leaseContracts?.some(contract =>
          contract.listing?.id === selectedListing.id
        )
      );
    }

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(tenant =>
        formatFullName(tenant).toLowerCase().includes(lowercasedFilter) ||
        tenant?.email?.toLowerCase().includes(lowercasedFilter)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const activeLease_a = a.leaseContracts?.[0];
      const activeLease_b = b.leaseContracts?.[0];

      const multiplier = sortOrder === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return multiplier * formatFullName(a).localeCompare(formatFullName(b));
        case 'email':
          return multiplier * ((a.email || '').localeCompare(b.email || ''));
        case 'property':
          return multiplier * (
            (activeLease_a?.listing?.title || '').localeCompare(activeLease_b?.listing?.title || '')
          );
        case 'room':
          return multiplier * (
            (activeLease_a?.listing?.title || '').localeCompare(activeLease_b?.listing?.title || '')
          );
        case 'rent':
          const rentA = activeLease_a?.rentAmount || 0;
          const rentB = activeLease_b?.rentAmount || 0;
          return multiplier * (rentA - rentB);
        case 'leaseStart':
          const dateA = activeLease_a ? new Date(activeLease_a.startDate).getTime() : 0;
          const dateB = activeLease_b ? new Date(activeLease_b.startDate).getTime() : 0;
          return multiplier * (dateA - dateB);
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedListing, searchTerm, initialTenants, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const emptyRowsCount = ITEMS_PER_PAGE - currentData.length;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const listingOptions: ListingOption[] = [
    { value: 'all', label: 'All Listings' },
    ...initialListings.map((listing) => ({
      value: listing,
      label: listing.title || 'Untitled Listing'
    }))
  ];

  const handleListingChange = (option: ListingOption | null) => {
    if (!option) {
      setSelectedListing('all');
    } else {
      setSelectedListing(option.value);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-6 w-full">
          <div className="relative max-w-xs">
            <label className="sr-only">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search tenants..."
            />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <svg className="size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2 max-w-xs flex-1">
            <span className="text-sm text-gray-500">Filter by:</span>
            <Select<ListingOption>
              options={listingOptions}
              value={listingOptions.find(option => 
                selectedListing === 'all' 
                  ? option.value === 'all'
                  : option.value === selectedListing
              )}
              className="flex-1"
              placeholder="Select Listing"
              isClearable
              onChange={handleListingChange}
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
                  boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
                  '&:hover': {
                    borderColor: '#6366f1'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected 
                    ? '#6366f1'
                    : state.isFocused 
                      ? '#e0e7ff'
                      : 'white',
                  color: state.isSelected ? 'white' : '#111827',
                  '&:active': {
                    backgroundColor: '#6366f1'
                  }
                }),
                input: (base) => ({
                  ...base,
                  color: '#111827'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#111827'
                }),
                indicatorSeparator: (base) => ({
                  ...base,
                  backgroundColor: '#e5e7eb'
                }),
                dropdownIndicator: (base, state) => ({
                  ...base,
                  color: state.isFocused ? '#6366f1' : '#9ca3af',
                  '&:hover': {
                    color: '#6366f1'
                  }
                }),
                clearIndicator: (base, state) => ({
                  ...base,
                  color: state.isFocused ? '#6366f1' : '#9ca3af',
                  '&:hover': {
                    color: '#6366f1'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                })
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#6366f1',
                  primary75: '#818cf8',
                  primary50: '#a5b4fc',
                  primary25: '#e0e7ff',
                },
              })}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('name')}>
                  Tenant
                  {sortField === 'name' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('property')}>
                  Property
                  {sortField === 'property' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('room')}>
                  Room
                  {sortField === 'room' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('rent')}>
                  Rent
                  {sortField === 'rent' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                Payment Status
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('leaseStart')}>
                  Lease Period
                  {sortField === 'leaseStart' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentData.map((tenant) => {
              const activeLease = tenant.leaseContracts?.[0];
              const nextPayment = activeLease?.payments
                ?.sort((a, b) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime())
                ?.find(payment => payment.status === 'PENDING');
              
              return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded-full object-cover"
                          src={tenant.image || '/images/placeholder.jpg'}
                          alt={formatFullName(tenant)}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {formatFullName(tenant)}
                        </span>
                        <span className="text-sm text-gray-500">{tenant.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeLease?.listing.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.tenant?.currentRoom?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeLease?.rentAmount 
                      ? new Intl.NumberFormat('en-PH', {
                          style: 'currency',
                          currency: 'PHP'
                        }).format(activeLease.rentAmount)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {nextPayment ? (
                      <div className="flex flex-col">
                        <span className={cn(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          {
                            'bg-yellow-100 text-yellow-800': nextPayment.status === 'PENDING',
                            'bg-green-100 text-green-800': nextPayment.status === 'COMPLETED',
                            'bg-red-100 text-red-800': nextPayment.status === 'FAILED'
                          }
                        )}>
                          {nextPayment.status}
                        </span>
                        {nextPayment.dueDate && (
                          <span className="text-xs text-gray-500 mt-1">
                            Due: {format(new Date(nextPayment.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeLease ? (
                      <div className="flex flex-col">
                        <span>From: {format(new Date(activeLease.startDate), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-gray-400">
                          Due every: {activeLease.monthlyDueDate || '-'}
                        </span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(tenant)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
            {emptyRowsCount > 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No more tenants to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="py-4 px-6 border-t border-gray-100">
        <nav className="flex items-center justify-center space-x-2">
          <button
            type="button"
            className="p-2 inline-flex items-center rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">«</span>
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`min-w-[40px] text-sm rounded-full ${
                currentPage === index + 1 ? 'bg-gray-100' : ''
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="p-2 inline-flex items-center rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span aria-hidden="true">»</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TenantTable;

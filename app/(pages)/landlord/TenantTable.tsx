'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SafeUser, SafeListing, TenantData } from '@/app/types';
import axios from 'axios';
import Select from 'react-select';
import toast from 'react-hot-toast';

interface TenantTableProps {
  currentUserId: string | undefined;
  tenants: TenantData[];
  listings: SafeListing[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

interface ListingOption {
  value: 'all' | SafeListing;
  label: string;
}

type SortField = 'name' | 'email' | 'property' | 'room' | 'rent' | 'leaseStart';
type SortOrder = 'asc' | 'desc';

const TenantTable: React.FC<TenantTableProps> = ({ 
  currentUserId, 
  tenants: initialTenants,
  listings: initialListings,
  isLoading = false
}) => {
  const [selectedListing, setSelectedListing] = useState<'all' | SafeListing>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<TenantData[]>(initialTenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const sortData = useCallback(() => {
    return [...filteredData].sort((a, b) => {
      const activeLease_a = a.leaseContracts
        .sort((x, y) => new Date(y.startDate).getTime() - new Date(x.startDate).getTime())[0];
      const activeLease_b = b.leaseContracts
        .sort((x, y) => new Date(y.startDate).getTime() - new Date(x.startDate).getTime())[0];

      const multiplier = sortOrder === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return multiplier * ((a.name || '').localeCompare(b.name || ''));
        case 'email':
          return multiplier * ((a.email || '').localeCompare(b.email || ''));
        case 'property':
          const propertyA = activeLease_a?.listing?.title || '';
          const propertyB = activeLease_b?.listing?.title || '';
          return multiplier * propertyA.localeCompare(propertyB);
        case 'room':
          const roomA = a.tenantProfile?.currentRoom?.title || '';
          const roomB = b.tenantProfile?.currentRoom?.title || '';
          return multiplier * roomA.localeCompare(roomB);
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
  }, [filteredData, sortField, sortOrder]);

  useEffect(() => {
    let filtered = initialTenants;

    if (selectedListing !== 'all') {
      filtered = initialTenants.filter(tenant =>
        tenant.leaseContracts.some(contract =>
          contract.listing.id === selectedListing.id
        )
      );
    }

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(
        tenant =>
          tenant?.name?.toLowerCase().includes(lowercasedFilter) ||
          tenant?.email?.toLowerCase().includes(lowercasedFilter)
      );
    }

    filtered = sortData();

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedListing, searchTerm, initialTenants, sortData]);

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
                control: (base) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  borderColor: '#e5e7eb',
                }),
              }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { field: 'name' as SortField, label: 'Name' },
                { field: 'email' as SortField, label: 'Email' },
                { field: 'property' as SortField, label: 'Property' },
                { field: 'room' as SortField, label: 'Room' },
                { field: 'rent' as SortField, label: 'Rent' },
                { field: 'leaseStart' as SortField, label: 'Lease Period' },
              ].map(({ field, label }) => (
                <th 
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {sortField === field && (
                      <span className="text-gray-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {currentData.length > 0 ? (
              currentData.map((tenant: TenantData) => {
                const activeLease = tenant.leaseContracts
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
                
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tenant.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tenant.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {activeLease?.listing.title || 'No active lease'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tenant.tenantProfile?.currentRoom?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {activeLease ? `₱${activeLease.rentAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {activeLease ? (
                        `${new Date(activeLease.startDate).toLocaleDateString()} - 
                         ${new Date(activeLease.endDate).toLocaleDateString()}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <button className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No tenants found
                </td>
              </tr>
            )}

            {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-16 bg-gray-50">
                {Array.from({ length: 6 }).map((_, cellIdx) => (
                  <td key={cellIdx} className="px-6 py-4">&nbsp;</td>
                ))}
              </tr>
            ))}
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

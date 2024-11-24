'use client';

import { SafeListing, SafeUser } from '@/app/types';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { AiOutlinePlusCircle, AiOutlineEye, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { FaArchive } from 'react-icons/fa';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import ListingModal from '@/app/components/Modals/ListingModal';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { toast } from 'react-hot-toast';

const truncateText = (text: string, limit: number) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};

interface ActiveListingsTableProps {
  data: SafeListing[];  // The prop should be an array of listings
  currentUser?: SafeUser | null;
}

const ITEMS_PER_PAGE = 5; // Number of items per page

type ListingStatus = 'ACTIVE' | 'PENDING' | 'ARCHIVED' | 'DECLINED';

type FilterValue = ListingStatus | 'all';

const FILTER_BADGES: Array<{
  value: FilterValue;
  label: string;
  color: string;
}> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'PENDING', label: 'Pending', color: 'orange' },
  { value: 'ARCHIVED', label: 'Archived', color: 'gray' },
  { value: 'DECLINED', label: 'Declined', color: 'red' },
];

const useClickOutside = (ref: any, callback: any) => {
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, callback]);
};

// Add a status priority map
const STATUS_PRIORITY: Record<ListingStatus, number> = {
  'ACTIVE': 1,
  'PENDING': 2,
  'ARCHIVED': 3,
  'DECLINED': 4,
};

// Define sortable columns type
type SortableColumns = 'title' | 'street' | 'status' | 'createdAt';

const ActiveListingsTable: React.FC<ActiveListingsTableProps> = ({ 
  data,
  currentUser 
}) => {
  const [listings, setListings] = useState<SafeListing[]>(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<SafeListing[]>(data);
  const [sortColumn, setSortColumn] = useState<SortableColumns>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedListing, setSelectedListing] = useState<SafeListing | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');

  const menuRef = useRef(null);

  useClickOutside(menuRef, () => {
    setIsOpen(false);
  });
  
  // Update listings state when data prop changes
  useEffect(() => {
    if (!data) return;
    
    const sortedData = [...data].sort((a, b) => 
      STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
    );
    
    setListings(sortedData);
    setFilteredData(sortedData);
  }, [data]);

  // Handle archive action - simplified version without socket
  const handleArchive = async (listingId: string) => {
    try {
      console.log('Before Archive - Listings:', listings);
      const response = await axios.patch(`/api/listings/${listingId}/status`, {
        status: 'ARCHIVED' as ListingStatus
      });
      console.log('Archive Response:', response.data);

      if (response.status === 200) {
        setListings(prev => {
          const updated = prev.map(listing => 
            listing.id === listingId 
              ? { ...listing, status: 'ARCHIVED' as ListingStatus }
              : listing
          );
          console.log('After Archive - Updated Listings:', updated);
          return updated;
        });
        
        setFilteredData(prev => 
          prev.map(listing => 
            listing.id === listingId 
              ? { ...listing, status: 'ARCHIVED' as ListingStatus }
              : listing
          )
        );
        
        toast.success('Listing archived successfully');
      }
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Failed to archive listing');
    }
  };

  // Filter listings based on search query and status filter
  useEffect(() => {
    if (!listings) return;
    
    let filtered = [...listings];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.barangay.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((listing) => listing.status === statusFilter);
    }

    // Sort by status priority and then by the selected sort column
    filtered.sort((a, b) => {
      // First sort by status priority
      const statusCompare = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (statusCompare !== 0) return statusCompare;
      
      // Then by the selected column
      if (sortColumn === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      
      if (sortColumn === 'street') {
        return sortOrder === 'asc'
          ? a.street.localeCompare(b.street)
          : b.street.localeCompare(a.street);
      }
      
      if (sortColumn === 'status') {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      
      if (sortColumn === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [listings, searchQuery, statusFilter, sortColumn, sortOrder]);

  // Add type-safe sort handler
  const handleSort = (column: SortableColumns) => {
    setSortOrder(currentOrder => 
      sortColumn === column 
        ? currentOrder === 'asc' ? 'desc' : 'asc'
        : 'asc'
    );
    setSortColumn(column);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Calculate how many empty rows are needed to maintain table height
  const emptyRowsCount = ITEMS_PER_PAGE - currentData.length;

  // Handle pagination clicks
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleView = useCallback((listing: SafeListing) => {
    setSelectedListing(listing);
    setIsViewModalOpen(true);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-6">
        <div className="relative max-w-xs">
          <label className="sr-only">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search listings..."
          />
          <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
            <svg
              className="size-4 text-gray-400 dark:text-neutral-500"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>
        
        <div className="flex gap-2">
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
              {badge.value !== 'all' && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white">
                  {listings.filter(item => item.status === badge.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500 cursor-pointer" style={{ minWidth: '150px' }} onClick={() => handleSort('title')}>
                Title {sortColumn === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500 cursor-pointer" style={{ minWidth: '150px' }} onClick={() => handleSort('street')}>
                Address {sortColumn === 'street' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500 cursor-pointer" style={{ minWidth: '100px' }} >
                Status 
              </th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500" style={{ minWidth: '100px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900" style={{ minHeight: '50px' }} title={listing.title}>
                  {truncateText(listing.title, 25) || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900" style={{ minHeight: '50px' }}>
                  {listing.street && listing.barangay ? `${listing.street}, ${listing.barangay}` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900" style={{ minHeight: '50px' }}>
                  <StatusBadge status={listing.status} />
                </td>
                <td className="px-6 py-4 text-end space-x-2">
                  <button onClick={() => handleView(listing)} className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100">
                    <AiOutlineEye className="mr-1" />View
                  </button>
                  {listing.status !== 'ARCHIVED' && (
                    <><Link href={`/landlord/listings/edit/${listing.id}`}>
                      <button className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-green-700 bg-green-50 hover:bg-green-100">
                        <AiOutlineEdit className="mr-1" />Edit
                      </button>
                    </Link>
                    <button onClick={() => handleArchive(listing.id)} className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-gray-700 bg-gray-50 hover:bg-gray-100">
                      <FaArchive className="mr-1" />Archive
                    </button></>
                  )}
                  {listing.status === 'ARCHIVED' && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-gray-500 bg-gray-100">
                      Archived
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-16 bg-gray-100">
                <td className="px-6 py-4" style={{ minHeight: '50px' }}>&nbsp;</td>
                <td className="px-6 py-4" style={{ minHeight: '50px' }}>&nbsp;</td>
                <td className="px-6 py-4" style={{ minHeight: '50px' }}>&nbsp;</td>
                <td className="px-6 py-4" style={{ minHeight: '50px' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedListing && (
        <ListingModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          listing={selectedListing}
          currentUser={currentUser}
        />
      )}

      {/* Pagination Section */}
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
              className={`min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full ${
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
      {/* End of Pagination */}
    </div>
  );
};

export default ActiveListingsTable;

function setIsOpen(arg0: boolean) {
  throw new Error('Function not implemented.');
}


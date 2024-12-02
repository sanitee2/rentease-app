'use client';

import { SafeListing, SafeUser } from '@/app/types';
import { useState, useMemo } from 'react';
import { AiOutlineEye, AiOutlineEdit } from 'react-icons/ai';
import { FaArchive } from 'react-icons/fa';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import ListingModal from '@/app/components/Modals/ListingModal';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Button } from "@/components/ui/button";

interface ActiveListingsTableProps {
  data: SafeListing[];
  currentUser?: SafeUser | null;
}

const ITEMS_PER_PAGE = 5;

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

const ActiveListingsTable = ({ data, currentUser }: ActiveListingsTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<SafeListing | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Handle archive action
  const handleArchive = async (listingId: string) => {
    try {
      const response = await axios.patch(`/api/listings/${listingId}/status`, {
        status: 'ARCHIVED' as ListingStatus
      });

      if (response.status === 200) {
        // Update the data locally
        const updatedData = data.map(listing =>
          listing.id === listingId
            ? { ...listing, status: 'ARCHIVED' as ListingStatus }
            : listing
        );
        // Update your data state here if needed
        toast.success('Listing archived successfully');
      }
    } catch (error) {
      toast.error('Failed to archive listing');
    }
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...data];

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

    // Sort by creation date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate empty rows needed
  const emptyRows = Math.max(0, 5 - paginatedListings.length);

  return (
    <>
      {/* Search and Filter Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
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
                  setCurrentPage(1);
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
                    {filteredListings.filter(item => item.status === badge.value).length}
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
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {listing.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {listing.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {listing.street}, {listing.barangay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={listing.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedListing(listing);
                      setIsViewModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <AiOutlineEye className="h-4 w-4" />
                  </Button>
                  {listing.status !== 'ARCHIVED' && (
                    <>
                      <Link href={`/landlord/listings/edit/${listing.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-900"
                        >
                          <AiOutlineEdit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(listing.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FaArchive className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {/* Add empty rows to maintain height */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className="bg-gray-50/50">
                <td colSpan={5} className="px-6 py-4 h-[73px] border-b border-gray-100"></td>
              </tr>
            ))}
            {paginatedListings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No listings to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredListings.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{filteredListings.length}</span>
              {' '}results
            </p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedListing && (
        <ListingModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          listing={selectedListing}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default ActiveListingsTable;


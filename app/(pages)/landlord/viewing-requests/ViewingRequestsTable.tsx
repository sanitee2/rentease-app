'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ViewingRequestsTableProps {
  currentData: any[];
}

const ITEMS_PER_PAGE = 5;

type RequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';
type FilterValue = RequestStatus | 'all';

const FILTER_BADGES: Array<{
  value: FilterValue;
  label: string;
  color: string;
}> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'DECLINED', label: 'Declined', color: 'red' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'gray' }
];

const ViewingRequestsTable = ({ currentData }: ViewingRequestsTableProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Calculate total counts from original data (not filtered)
  const statusCounts = useMemo(() => {
    return {
      PENDING: currentData.filter(req => req.status === 'PENDING').length,
      APPROVED: currentData.filter(req => req.status === 'APPROVED').length,
      DECLINED: currentData.filter(req => req.status === 'DECLINED').length,
      CANCELLED: currentData.filter(req => req.status === 'CANCELLED').length,
    };
  }, [currentData]);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = [...currentData];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(request => 
        request.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Sort by creation date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [currentData, searchQuery, statusFilter]);

  // Handle request status update
  const handleUpdateStatus = async (requestId: string, newStatus: RequestStatus) => {
    if (newStatus === 'DECLINED' && !declineReason) {
      setSelectedRequest(requestId);
      setShowDeclineDialog(true);
      return;
    }

    try {
      await axios.patch(`/api/viewing-requests/${requestId}`, { 
        status: newStatus,
        declineReason: newStatus === 'DECLINED' ? declineReason : undefined
      });
      toast.success('Request status updated successfully');
      router.refresh();
      setDeclineReason('');
      setShowDeclineDialog(false);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate empty rows needed
  const emptyRows = Math.max(0, ITEMS_PER_PAGE - paginatedRequests.length);

  return (
    <>
      {/* Search and Filter Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => setStatusFilter(badge.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === badge.value 
                    ? `bg-${badge.color}-100 text-${badge.color}-800` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {badge.label}
                {badge.value !== 'all' && (
                  <span className="ml-1">
                    {statusCounts[badge.value as keyof typeof statusCounts] || 0}
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
                Requester
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
                Preferred Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Image
                      className="h-10 w-10 rounded-full object-cover"
                      src={request.user.image || '/images/placeholder.jpg'}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user.firstName} {request.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.listing.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.room?.title || 'Any Room'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      request.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(request.date), 'PPP')}
                  <div className="text-xs text-gray-400">
                    {format(new Date(request.time), 'p')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.user.phoneNumber || 'No phone number'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {request.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'DECLINED')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {/* Add empty rows to maintain height */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className="bg-gray-50/50">
                <td colSpan={7} className="px-6 py-4 h-[73px] border-b border-gray-100"></td>
              </tr>
            ))}
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{filteredRequests.length}</span>
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

      {/* Decline Reason Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={() => setShowDeclineDialog(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Decline Viewing Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this viewing request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-gray-200 p-3"
                placeholder="Enter reason for declining..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeclineDialog(false);
                setDeclineReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (declineReason.trim() && selectedRequest) {
                  handleUpdateStatus(selectedRequest, 'DECLINED');
                }
              }}
              disabled={!declineReason.trim()}
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewingRequestsTable; 
'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle2, XCircle, Wrench, AlertTriangle } from "lucide-react";
import MaintenanceDetailsModal from '@/app/components/Modals/MaintenanceDetailsModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { STATUS_STYLES, PRIORITY_STYLES } from '@/app/constants/maintenance';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  images?: string[];
  tenant: {
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
  };
  listing: {
    title: string;
  };
  room?: {
    title: string;
  } | null;
}

const ITEMS_PER_PAGE = 5;

type FilterValue = 'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const FILTER_BADGES = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
] as const;

const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};

export default function MaintenanceTable() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((request) =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Sort by creation date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests, searchQuery, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const emptyRows = Math.max(0, ITEMS_PER_PAGE - paginatedRequests.length);

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/maintenance');
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch maintenance requests:', error);
        toast.error('Failed to load maintenance requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, []);


  

  return (
    <>
      {/* Search and Filter Section */}
      <div className="overflow-x-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tenants..."
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
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pending <span className="ml-1">{requests.filter(r => r.status === 'PENDING').length}</span>
              </button>
              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                In Progress <span className="ml-1">{requests.filter(r => r.status === 'IN_PROGRESS').length}</span>
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Completed <span className="ml-1">{requests.filter(r => r.status === 'COMPLETED').length}</span>
              </button>
              <button
                onClick={() => setStatusFilter('CANCELLED')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cancelled <span className="ml-1">{requests.filter(r => r.status === 'CANCELLED').length}</span>
              </button>
            </div>
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
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
                  <div className="text-sm font-medium text-gray-900" title={request.title}>
                    {truncateText(request.title, 15)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.tenant.firstName} {request.tenant.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.listing.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.room ? (
                    <div className="text-sm text-gray-900">{request.room.title}</div>
                  ) : (
                    <div className="text-sm text-gray-500">No room</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[request.status].badge}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className={`capitalize ${PRIORITY_STYLES[request.priority].badge}`}>
                    {request.priority.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedRequest(request)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {/* Empty rows */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className="bg-gray-50/50">
                <td 
                  colSpan={8}
                  className="px-6 py-4 whitespace-nowrap h-[73px] border-b border-gray-100"
                />
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td 
                  colSpan={8} 
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No maintenance requests to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Details Modal */}
      {selectedRequest && (
        <MaintenanceDetailsModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
        />
      )}
    </>
  );
} 
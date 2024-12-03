'use client';

import Container from "@/app/components/Container";
import { RequestViewing } from "@prisma/client";
import { format } from "date-fns";
import { FaCheckCircle, FaTimesCircle, FaEye, FaSearch, FaBan } from 'react-icons/fa';
import { MdChevronRight, MdChevronLeft } from "react-icons/md";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RequestViewingStatus } from "@prisma/client";
import ViewingRequestDetailsModal from "@/app/components/Modals/ViewingRequestDetailsModal";
import { useRouter } from "next/navigation";

interface ViewingRequestsClientProps {
  requests: (RequestViewing & {
    listing: {
      id: string;
      title: string;
      user?: {
        firstName: string;
        lastName: string;
        email?: string | null;
        phoneNumber?: string | null;
      };
    };
    room?: {
      id: string;
      title: string;
    } | null;
  })[];
}

const ITEMS_PER_PAGE = 5;

const ViewingRequestsClient: React.FC<ViewingRequestsClientProps> = ({
  requests
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<(RequestViewing & {
    listing: {
      id: string;
      title: string;
      user?: {
        firstName: string;
        lastName: string;
        email?: string | null;
        phoneNumber?: string | null;
      };
    };
    room?: {
      id: string;
      title: string;
    } | null;
  }) | null>(null);
  const router = useRouter();

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.listing.title.toLowerCase().includes(search.toLowerCase()) ||
      request.room?.title?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      request.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusIcon = (status: RequestViewingStatus) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className="h-6 w-6 text-emerald-500 mt-1" />;
      case 'DECLINED':
        return <FaTimesCircle className="h-6 w-6 text-rose-500 mt-1" />;
      case 'CANCELLED':
        return <FaBan className="h-6 w-6 text-gray-500 mt-1" />;
      default:
        return <FaCheckCircle className="h-6 w-6 text-yellow-500 mt-1" />;
    }
  };

  const getStatusClass = (status: RequestViewingStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-600';
      case 'DECLINED':
        return 'bg-rose-100 text-rose-600';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <div className="pb-20 pt-10">
      <Container>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Viewing Requests</h2>
              <p className="text-gray-500 text-base">
                Track your property viewing requests
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by property or room..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count with pagination info */}
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedRequests.length)} of {sortedRequests.length} requests
          </div>

          {/* Requests list */}
          <div className="space-y-6">
            {paginatedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between border p-4 rounded-xl border-gray-100 pb-4 pr-6">
                <div className="flex gap-4 items-center">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold">
                        {request.listing.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      {format(new Date(request.date), 'MMM d, yyyy')} at {format(new Date(request.time), 'h:mm a')}
                    </div>
                    {request.room && (
                      <div className="text-gray-500 mt-1">
                        Room: {request.room.title}
                      </div>
                    )}
                    {request.declineReason && request.status === 'DECLINED' && (
                      <div className="text-rose-500 text-sm mt-1">
                        Reason: {request.declineReason}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRequest(request)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <FaEye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdChevronLeft className="h-4 w-4" />
              </Button>
              
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <MdChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* No results message */}
          {sortedRequests.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No viewing requests found matching your filters
            </div>
          )}

          {selectedRequest && (
            <ViewingRequestDetailsModal
              isOpen={!!selectedRequest}
              onClose={() => setSelectedRequest(null)}
              request={selectedRequest}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export default ViewingRequestsClient; 
'use client';

import Container from "@/app/components/Container";
import { MaintenanceRequest, MaintenancePriority, MaintenanceStatus } from "@prisma/client";
import { format } from "date-fns";
import { FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaBan, FaClock, FaSpinner } from "react-icons/fa";
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
import { Badge } from "@/components/ui/badge";
import TenantMaintenanceDetailsModal from "@/app/components/Modals/TenantMaintenanceDetailsModal";
import { MaintenanceRequest as MaintenanceRequestType } from "@/app/types";

interface MaintenanceClientProps {
  maintenanceRequests: (MaintenanceRequest & {
    listing: {
      id: string;
      title: string;
      imageSrc: { images: string[] };
    };
    room: {
      title: string;
    } | null;
  })[];
}

const ITEMS_PER_PAGE = 5;

const MaintenanceClient: React.FC<MaintenanceClientProps> = ({
  maintenanceRequests
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<Partial<MaintenanceRequestType> | null>(null);

  // Filter requests
  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.listing.title.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      request.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority = 
      priorityFilter === 'all' || 
      request.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority-high':
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      case 'priority-low':
        return getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
      default:
        return 0;
    }
  });

  // Helper function to get priority weight for sorting
  const getPriorityWeight = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'URGENT': return 4;
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add getStatusIcon function
  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="text-green-500 w-5 h-5" />;
      case 'IN_PROGRESS':
        return <FaSpinner className="text-blue-500 w-5 h-5 animate-spin" />;
      case 'CANCELLED':
        return <FaBan className="text-gray-500 w-5 h-5" />;
      case 'PENDING':
      default:
        return <FaClock className="text-yellow-500 w-5 h-5" />;
    }
  };

  return (
    <div className="pb-20 pt-10">
      <Container>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Maintenance Requests</h2>
              <p className="text-gray-500 text-base">
                Track and manage your maintenance requests
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by title or property..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="priority-high">Highest Priority</SelectItem>
                  <SelectItem value="priority-low">Lowest Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedRequests.length)} of {sortedRequests.length} requests
          </div>

          {/* Maintenance requests list */}
          <div className="space-y-6">
            {paginatedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between border p-4 pr-6 rounded-xl border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="mt-1">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{request.title}</span>
                      <Badge className={getStatusBadge(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityBadge(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {request.listing.title}
                      {request.room && ` • Room: ${request.room.title}`} • Submitted on {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRequest({
                    id: request.id,
                    title: request.title,
                    description: request.description,
                    status: request.status,
                    priority: request.priority,
                    createdAt: request.createdAt.toISOString(),
                    images: request.images,
                    listing: {
                      id: request.listing.id,
                      title: request.listing.title
                    },
                    room: request.room
                  })}
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
              No maintenance requests found matching your filters
            </div>
          )}

          {selectedRequest && (
            <TenantMaintenanceDetailsModal
              isOpen={!!selectedRequest}
              onClose={() => setSelectedRequest(null)}
              request={selectedRequest}
              setSelectedRequest={setSelectedRequest}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export default MaintenanceClient; 
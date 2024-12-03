'use client';

import Container from "@/app/components/Container";
import { Payment } from "@prisma/client";
import { format } from "date-fns";
import { FaCheckCircle, FaTimesCircle, FaEye, FaSearch, FaBan } from "react-icons/fa";
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

interface PaymentsClientProps {
  payments: (Payment & {
    lease: {
      room: {
        title: string;
      } | null;
      listing: {
        title: string;
      };
    };
  })[];
}

const ITEMS_PER_PAGE = 5;

const PaymentsClient: React.FC<PaymentsClientProps> = ({
  payments
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.lease.listing.title.toLowerCase().includes(search.toLowerCase()) ||
      payment.amount.toString().includes(search);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      payment.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = sortedPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-20 pt-10">
      <Container>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Recent Payments</h2>
              <p className="text-gray-500 text-base">
                Your latest payment transactions
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by property or amount..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count with pagination info */}
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedPayments.length)} of {sortedPayments.length} payments
          </div>

          {/* Payments list */}
          <div className="space-y-6">
            {paginatedPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border p-4 rounded-xl border-gray-100 pb-4 pr-6">
                <div className="flex gap-4 items-center">
                  {payment.status === 'COMPLETED' ? (
                    <FaCheckCircle className="h-6 w-6 text-emerald-500 mt-1" />
                  ) : payment.status === 'FAILED' ? (
                    <FaTimesCircle className="h-6 w-6 text-rose-500 mt-1" />
                  ) : (
                    <FaBan className="h-6 w-6 text-gray-500 mt-1" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold">
                        ₱{payment.amount.toLocaleString('en-US')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        payment.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-600'
                          : payment.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {payment.status === 'COMPLETED' 
                          ? 'COMPLETED' 
                          : payment.status === 'FAILED'
                          ? 'FAILED'
                          : 'CANCELLED'}
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      GCASH • {format(new Date(payment.createdAt), 'MMM d, yyyy')} • Period: {format(new Date(payment.createdAt), 'MMM d')} - {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </div>
                    {payment.lease.listing.title && (
                      <div className="text-gray-500 mt-1">
                        {payment.lease.listing.title}
                      </div>
                    )}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <FaEye size={16} />
                  <span>View</span>
                </button>
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
          {sortedPayments.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No payments found matching your filters
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default PaymentsClient; 
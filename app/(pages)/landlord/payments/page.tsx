'use client';

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PaymentStatus, PaymentMode } from "@prisma/client";
import toast from 'react-hot-toast';
import LoadingState from '@/app/components/LoadingState';
import PaymentsTable from "../PaymentsTable";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Payment = {
  id: string;
  userId: string;
  leaseId: string;
  amount: number;
  image: string | null;
  description: string | null;
  status: PaymentStatus;
  paymentMethod: PaymentMode;
  createdAt: Date;
  tenantProfileId: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  listingId: string | null;
  roomId: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    image: string | null;
  };
  lease: {
    rentAmount: number;
    listing: {
      title: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
    room?: {
      title: string;
    } | null;
  };
};

export default function LandlordPaymentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  // Fetch payments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/payments/landlord');
        if (Array.isArray(response.data)) {
          setPayments(response.data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        toast.error('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter payments based on search and status
  useEffect(() => {
    if (!payments) return;
    
    let filtered = [...payments];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(payment => 
        payment.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        payment.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        payment.lease.listing.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, search, statusFilter]);

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'COMPLETED').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    totalAmount: payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  const handlePaymentUpdate = (updatedPayment: any) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === updatedPayment.id ? updatedPayment : payment
      )
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Payments
          </h1>
          <Breadcrumbs />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Payments</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Completed Payments</p>
            <p className="text-2xl font-semibold">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
            <p className="text-2xl font-semibold">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
            <p className="text-2xl font-semibold">₱{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage tenant payment transactions
            </p>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[
                  { value: 'ALL', label: 'All', color: 'gray' },
                  { value: 'PENDING', label: 'Pending', color: 'yellow' },
                  { value: 'COMPLETED', label: 'Completed', color: 'green' },
                  { value: 'FAILED', label: 'Failed', color: 'red' }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value as PaymentStatus | "ALL")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusFilter === status.value 
                        ? `bg-${status.color}-100 text-${status.color}-800` 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {status.label}
                    {status.value !== 'ALL' && (
                      <span className="ml-1">
                        {payments.filter(p => p.status === status.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <PaymentsTable 
            data={filteredPayments} 
            onPaymentUpdate={handlePaymentUpdate}
          />
        </div>
      </div>
    </div>
  );
} 
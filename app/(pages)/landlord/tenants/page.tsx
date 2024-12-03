'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { SafeListing, TenantData } from '@/app/types';
import toast from 'react-hot-toast';
import LoadingState from '@/app/components/LoadingState';
import TenantTable from '../TenantTable';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { LeaseStatus } from '@prisma/client';
import AddTenantModal from '@/app/components/Modals/AddTenantModal';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import LeaseHistoryTable from '../LeaseHistoryTable';
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

type FilterValue = LeaseStatus | 'all';

const FILTER_BADGES: Array<{
  value: FilterValue;
  label: string;
  color: string;
}> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
];

const Tenants = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');
  const [filteredData, setFilteredData] = useState<TenantData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch tenants data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/tenants');
        if (Array.isArray(response.data)) {
          setTenants(response.data);
        }
      } catch (err) {
        console.error('Error fetching tenants:', err);
        toast.error('Failed to load tenants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tenants based on search and status
  useEffect(() => {
    if (!tenants) return;
    
    let filtered = [...tenants];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((tenant) =>
        tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tenant) => {
        // Get the most recent lease contract
        const sortedLeases = tenant.leaseContracts?.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const recentLease = sortedLeases?.[0];
        return recentLease?.status === statusFilter;
      });
    }

    setFilteredData(filtered);
  }, [tenants, searchQuery, statusFilter]);

  const handleRemoveTenant = async (tenantId: string) => {
    try {
      await axios.delete(`/api/tenants/${tenantId}`);
      toast.success('Tenant removed successfully');
      // Refresh data
      const response = await axios.get('/api/tenants');
      if (Array.isArray(response.data)) {
        setTenants(response.data);
      }
    } catch (error) {
      console.error('Error removing tenant:', error);
      toast.error('Failed to remove tenant');
    }
  };

  const handleAddSuccess = (newTenant: TenantData) => {
    setTenants(prev => [...prev, newTenant]);
    toast.success('Tenant added successfully');
  };

  // Add this function to serialize dates
  const serializeData = (data: any) => {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (key === 'createdAt' || key === 'startDate' || key === 'endDate') {
        return value ? new Date(value).toISOString() : null;
      }
      return value;
    }));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Tenants
            </h1>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-sm font-medium"
            >
              <AiOutlinePlusCircle className="mr-2" /> Add New Tenant
            </button>
          </div>
          <Breadcrumbs />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Tenants</p>
            <p className="text-2xl font-semibold">{tenants.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Active Tenants</p>
            <p className="text-2xl font-semibold">
              {tenants.filter(t => t.leaseContracts?.[0]?.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending Applications</p>
            <p className="text-2xl font-semibold">
              {tenants.filter(t => t.leaseContracts?.[0]?.status === 'PENDING').length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Your Tenants</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor your property tenants
            </p>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search tenants..."
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
                        {tenants.filter(t => t.leaseContracts?.[0]?.status === badge.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TenantTable 
            currentData={filteredData}
            onRemoveTenant={handleRemoveTenant}
          />
        </div>

        {/* Add this section for lease history */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Lease History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete history of all lease contracts
            </p>
          </div>
          {isLoading ? (
            <LoadingState />
          ) : (
            <LeaseHistoryTable 
              currentData={tenants} 
            />
          )}
        </div>
      </div>

      <AddTenantModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default Tenants;

'use client';

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import TenantTable from '../TenantTable';
import AddTenantModal from '@/app/components/Modals/AddTenantModal';
import { SafeListing, TenantData } from '@/app/types';
import toast from 'react-hot-toast';
import LoadingState from '@/app/components/LoadingState';

const Tenants = () => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<SafeListing[]>([]);
  const [tenants, setTenants] = useState<TenantData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch listings and tenants in parallel
        const [listingsResponse, tenantsResponse] = await Promise.all([
          axios.get('/api/listings'),
          axios.get('/api/tenants')
        ]);

        setListings(listingsResponse.data);
        setTenants(tenantsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Tenants
            </h1>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
            >
              + Add New Tenant
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
            <p className="text-sm text-gray-500 mb-1">Active Leases</p>
            <p className="text-2xl font-semibold">
              {tenants.filter(t => 
                t.leaseContracts.some(lc => 
                  new Date(lc.endDate) >= new Date()
                )
              ).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Properties with Tenants</p>
            <p className="text-2xl font-semibold">
              {new Set(tenants.flatMap(t => 
                t.leaseContracts.map(lc => lc.listing.id)
              )).size}
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
          <TenantTable 
            currentUserId={undefined}
            tenants={tenants}
            listings={listings}
            isLoading={isLoading}
          />
        </div>

        <AddTenantModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      </div> 
    </div>
  );
}

export default Tenants;

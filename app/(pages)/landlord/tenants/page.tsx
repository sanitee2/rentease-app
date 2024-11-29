'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import TenantTable from '../TenantTable';
import AddTenantModal from '@/app/components/Modals/AddTenantModal';
import { SafeListing, TenantData } from '@/app/types';
import toast from 'react-hot-toast';
import LoadingState from '@/app/components/LoadingState';
import TenantDetailsModal from '@/app/components/Modals/TenantDetailsModal';

const Tenants = () => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<SafeListing[]>([]);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [listingsResponse, tenantsResponse] = await Promise.all([
        axios.get('/api/listings'),
        axios.get('/api/tenants')
      ]);

      setListings(listingsResponse.data);
      setTenants(tenantsResponse.data);
    } catch (err) {
      console.error('Error refreshing data:', err);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTenantRemoval = useCallback(async (tenantId: string) => {
    try {
      await axios.delete(`/api/tenants/${tenantId}/remove`);
      await refreshData();
      toast.success('Tenant removed successfully');
    } catch (error) {
      console.error('Error removing tenant:', error);
      toast.error('Failed to remove tenant');
    }
  }, [refreshData]);

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
              {tenants.filter(tenant => {
                if (!tenant?.leaseContracts) return false;
                return tenant.leaseContracts.some(contract => 
                  contract.endedAt ? new Date(contract.endedAt) >= new Date() : false
                );
              }).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Properties with Tenants</p>
            <p className="text-2xl font-semibold">
              {new Set(tenants
                .filter(t => t?.leaseContracts)
                .flatMap(t => 
                  t.leaseContracts?.map(lc => lc.listing?.id) ?? []
                )
              ).size}
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
            onViewDetails={(tenant) => {
              setSelectedTenant(tenant);
              setIsDetailsModalOpen(true);
            }}
            onRemoveTenant={handleTenantRemoval}
          />
        </div>

        <AddTenantModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            // Reset the form by forcing a remount of the modal
            if (!isAddModalOpen) {
              setIsAddModalOpen(false);
            }
          }}
          onSuccess={async (newTenant) => {
            try {
              // Fetch fresh data after adding
              await refreshData();
              setIsAddModalOpen(false);
              toast.success('Tenant added successfully');
            } catch (error) {
              console.error('Error refreshing data:', error);
              toast.error('Failed to refresh tenant data');
            }
          }}
        />

        {selectedTenant && (
          <TenantDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedTenant(null);
            }}
            tenant={selectedTenant}
            onRemove={handleTenantRemoval}
          />
        )}
      </div> 
    </div>
  );
}

export default Tenants;

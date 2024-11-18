'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { TenantData } from '@/app/types';
import { IoTrashOutline, IoCloseOutline } from "react-icons/io5";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';

interface TenantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantData;
  onRemove: (tenantId: string) => Promise<void>;
}

const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onRemove,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  // Get current date at midnight for accurate comparison
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Sort leases by start date and find the active one
  const sortedLeases = tenant.leaseContracts
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // Find the active lease (end date is after or equal to current date)
  const activeLease = sortedLeases.find(lease => {
    const endDate = new Date(lease.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= currentDate;
  });

  const handleTenantRemoval = async () => {
    try {
      setIsRemoving(true);
      await onRemove(tenant.id);
      onClose();
    } catch (error) {
      console.error('Error removing tenant:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatFullName = (tenant: TenantData) => {
    const parts = [
      tenant.firstName,
      tenant.middleName ? `${tenant.middleName.charAt(0)}.` : '',
      tenant.lastName,
      tenant.suffix || ''
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium mb-4">
                  Tenant Details
                </Dialog.Title>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="lease-history">Lease History</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Personal Information</h3>
                        <div className="mt-2 space-y-2">
                          <p><span className="text-gray-500">Name:</span> {formatFullName(tenant)}</p>
                          <p><span className="text-gray-500">Email:</span> {tenant.email}</p>
                          <p><span className="text-gray-500">Current Room:</span> {tenant.tenantProfile?.currentRoom?.title || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium">Active Lease</h3>
                        {activeLease ? (
                          <div className="mt-2 space-y-2">
                            <p><span className="text-gray-500">Property:</span> {activeLease.listing.title}</p>
                            <p><span className="text-gray-500">Rent:</span> ₱{activeLease.rentAmount.toLocaleString()}</p>
                            <p>
                              <span className="text-gray-500">Duration:</span>{' '}
                              {new Date(activeLease.startDate).toLocaleDateString()} - {new Date(activeLease.endDate).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="text-gray-500">Status:</span>{' '}
                              <span className="text-green-600">Active</span>
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-gray-500">No active lease</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lease-history">
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="space-y-4 p-1">
                        {sortedLeases.map((lease) => (
                          <div key={lease.id} className="p-4 border rounded-lg">
                            <h4 className="font-medium">{lease.listing.title}</h4>
                            <div className="mt-2 space-y-1">
                              <p><span className="text-gray-500">Rent:</span> ₱{lease.rentAmount.toLocaleString()}</p>
                              <p><span className="text-gray-500">Period:</span> {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</p>
                              <p>
                                <span className="text-gray-500">Status:</span>{' '}
                                <span className={`${new Date(lease.endDate) >= new Date() ? 'text-green-600' : 'text-gray-600'}`}>
                                  {new Date(lease.endDate) >= new Date() ? 'Active' : 'Expired'}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="payments">
                    <div className="text-center py-8 text-gray-500">
                      Payment history will be available soon
                    </div>
                  </TabsContent>

                  <TabsContent value="maintenance">
                    <div className="text-center py-8 text-gray-500">
                      Maintenance requests will be available soon
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this tenant? This will end their current lease and change their role back to user.')) {
                        handleTenantRemoval();
                      }
                    }}
                    disabled={isRemoving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isRemoving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TenantDetailsModal; 
import React from 'react'
import ActiveListingsTable from '../ActiveListingsTable'
import getListings from '@/app/actions/getListings';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserListings from '@/app/actions/getUserListings';
import { redirect } from 'next/navigation';
import RoomsTable from '../RoomsTable';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Link from 'next/link';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import LoadingState from '@/app/components/LoadingState';

function Loading() {
  return <LoadingState />;
}

const Listings = async() => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return redirect('/');
  }
  const listings = await getUserListings(currentUser.id);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Listings
            </h1>
            <Link 
              href="/landlord/listings/add-listing"
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-sm font-medium"
            >
              <AiOutlinePlusCircle className="mr-2" /> Add New Listing
            </Link>
          </div>
          <Breadcrumbs />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Listings</p>
            <p className="text-2xl font-semibold">{listings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Active Listings</p>
            <p className="text-2xl font-semibold">
              {listings.filter(l => l.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending Review</p>
            <p className="text-2xl font-semibold">
              {listings.filter(l => l.status === 'PENDING').length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Your Listings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor your property listings
            </p>
          </div>
            <ActiveListingsTable data={listings} currentUser={currentUser}/>
        </div>
      </div>
    </div>
  )
}

export default Listings;

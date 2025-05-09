import { Suspense } from 'react';
import { Card } from "@/components/ui/card";
import {
  LuUsers,
  LuHome,
  LuCheckCircle,
  LuAlertCircle,
  LuList,
  LuBed,
  LuSettings
} from "react-icons/lu";

import LoadingState from './components/loading';
import SystemStats from './components/SystemStats';
import RecentListings from './components/RecentListings';
import AmenitiesManager from './components/AmenitiesManager';
import ListingCategories from './components/ListingCategories';
import PendingListings from './components/PendingListings';
import RoomCategories from './components/RoomCategories';
import DashboardActions from './components/DashboardActions';
import ChartContainer from './components/ChartContainer';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'System administration and management dashboard'
};

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>

        {/* Quick Stats */}
        <Suspense fallback={<LoadingState />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <SystemStats />
          </div>
        </Suspense>

        {/* Quick Stats Charts */}
        <ChartContainer />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Listings Verification */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuCheckCircle className="text-indigo-500" />
                Pending Listings
              </h2>
              <DashboardActions path="/admin/listings?status=pending" />
            </div>
            <Suspense fallback={<LoadingState />}>
              <PendingListings />
            </Suspense>
          </Card>

          {/* Recent Listings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuHome className="text-indigo-500" />
                Recent Listings
              </h2>
              <DashboardActions path="/admin/listings?status=active" />
            </div>
            <Suspense fallback={<LoadingState />}>
              <RecentListings />
            </Suspense>
          </Card>

          {/* Listing Categories Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuList className="text-indigo-500" />
                Listing Categories
              </h2>
              <DashboardActions 
                path="/admin/categories?type=listing" 
                showAddButton 
                categoryType="listing"
              />
            </div>
            <Suspense fallback={<LoadingState />}>
              <ListingCategories />
            </Suspense>
          </Card>

          {/* Room Categories Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuBed className="text-indigo-500" />
                Room Categories
              </h2>
              <DashboardActions 
                path="/admin/categories?type=room" 
                showAddButton 
                categoryType="room"
              />
            </div>
            <Suspense fallback={<LoadingState />}>
              <RoomCategories />
            </Suspense>
          </Card>

          {/* Amenities Management */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuSettings className="text-indigo-500" />
                Amenities Management
              </h2>
              <DashboardActions path="/admin/amenities" />
            </div>
            <Suspense fallback={<LoadingState />}>
              <AmenitiesManager />
            </Suspense>
          </Card>
        </div>
      </div>
    </div>
  );
}

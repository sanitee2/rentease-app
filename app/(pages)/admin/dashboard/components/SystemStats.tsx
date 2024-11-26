'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { LuUsers, LuHome, LuCheckCircle } from "react-icons/lu";

interface SystemStatsData {
  totalLandlords: number;
  activeListings: number;
  pendingListings: number;
  landlordGrowth: string;
  listingGrowth: string;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  colorClass 
}: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  colorClass: string;
}) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <p className={`text-sm mt-1 ${trend.startsWith('+') ? 'text-indigo-600' : 'text-red-600'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </Card>
);

export default function SystemStats() {
  const [stats, setStats] = useState<SystemStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) return null;

  return (
    <>
      <StatCard
        icon={LuUsers}
        label="Total Landlords"
        value={stats.totalLandlords}
        trend={stats.landlordGrowth}
        colorClass="text-indigo-500"
      />
      <StatCard
        icon={LuHome}
        label="Active Listings"
        value={stats.activeListings}
        trend={stats.listingGrowth}
        colorClass="text-indigo-500"
      />
      <StatCard
        icon={LuCheckCircle}
        label="Pending Verifications"
        value={stats.pendingListings}
        colorClass="text-indigo-500"
      />
    </>
  );
} 
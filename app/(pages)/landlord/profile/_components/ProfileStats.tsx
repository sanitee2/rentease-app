'use client';

import { SafeUser } from "@/app/types";
import { useEffect, useState } from "react";
import axios from "axios";

interface ProfileStatsProps {
  currentUser: SafeUser;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalTenants: 0,
    totalPayments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/landlord/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Total Properties</p>
        <p className="text-2xl font-semibold">{stats.totalListings}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Total Tenants</p>
        <p className="text-2xl font-semibold">{stats.totalTenants}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Total Payments</p>
        <p className="text-2xl font-semibold">{stats.totalPayments}</p>
      </div>
    </div>
  );
};

export default ProfileStats; 
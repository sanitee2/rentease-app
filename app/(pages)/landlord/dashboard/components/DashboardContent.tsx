'use client';

import { useEffect, useState } from 'react';
import { 
  HiHome, 
  HiUsers, 
  HiCurrencyDollar,
  HiExclamationCircle 
} from 'react-icons/hi';
import DashboardCard from './DashboardCard';
import axios from 'axios';

interface DashboardStats {
  totalListings: number;
  activeLeases: number;
  totalRevenue: number;
  pendingMaintenance: number;
  occupancyRate: number;
}

const DashboardContent = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeLeases: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/api/landlord/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  const cards = [
    {
      title: 'Total Properties',
      value: stats.totalListings,
      icon: HiHome,
      description: `${stats.occupancyRate}% occupancy rate`,
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: 'Active Tenants',
      value: stats.activeLeases,
      icon: HiUsers,
      description: 'Current active lease contracts'
    },
    {
      title: 'Monthly Revenue',
      value: `₱${stats.totalRevenue.toLocaleString()}`,
      icon: HiCurrencyDollar,
      description: 'Total from all active leases',
      trend: {
        value: 8.2,
        isPositive: true
      }
    },
    {
      title: 'Maintenance Requests',
      value: stats.pendingMaintenance,
      icon: HiExclamationCircle,
      description: 'Pending maintenance requests',
      trend: {
        value: 2,
        isPositive: false
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <DashboardCard 
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          description={card.description}
          trend={card.trend}
        />
      ))}
    </div>
  );
};

export default DashboardContent; 
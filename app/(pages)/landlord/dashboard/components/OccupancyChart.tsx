'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  YAxisProps
} from 'recharts';

interface ChartData {
  month: string;
  revenue: number;
  occupancyRate: number;
  activeLeases: number;
  _debug?: {
    totalRooms: number;
    occupiedRooms: number;
    monthRange: string;
  };
}

export default function OccupancyChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get('/api/landlord/dashboard-trends');
        console.log('Chart Data:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard trends:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <p className="text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg h-[300px] flex flex-col items-center justify-center">
        <p className="text-gray-500">No data available</p>
        <p className="text-sm text-gray-400 mt-1">Start adding properties and tenants to see trends</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'revenue' 
                ? `Revenue: ₱${entry.value.toLocaleString()}`
                : entry.name === 'occupancyRate'
                ? `Occupancy: ${entry.value}%`
                : `Active Leases: ${entry.value}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          {/* Revenue Axis (Left) */}
          <YAxis
            yAxisId="revenue"
            orientation="left"
            stroke="#6366f1"
            fontSize={12}
            tickFormatter={(value) => `₱${value/1000}k`}
          />
          {/* Percentage Axis (Right) */}
          <YAxis
            yAxisId="percentage"
            orientation="right"
            stroke="#10b981"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            name="Monthly Revenue"
            dot={{ fill: '#6366f1', strokeWidth: 2 }}
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            dataKey="occupancyRate"
            stroke="#10b981"
            strokeWidth={2}
            name="Occupancy Rate"
            dot={{ fill: '#10b981', strokeWidth: 2 }}
          />
          <Line
            yAxisId="percentage"
            type="monotone"
            dataKey="activeLeases"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Active Leases"
            dot={{ fill: '#f59e0b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
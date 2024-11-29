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
  TooltipProps
} from 'recharts';

interface OccupancyData {
  month: string;
  occupancyRate: number;
}

export default function OccupancyChart() {
  const [data, setData] = useState<OccupancyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOccupancyData = async () => {
      try {
        const response = await axios.get('/api/landlord/occupancy-trends');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch occupancy data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOccupancyData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-gray-500">Loading occupancy data...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg h-[300px] flex flex-col items-center justify-center">
        <p className="text-gray-500">No occupancy data available</p>
        <p className="text-sm text-gray-400 mt-1">Add properties and tenants to see occupancy trends</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-indigo-600">
            {`Occupancy Rate: ${payload[0].value}%`}
          </p>
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
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="occupancyRate"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
'use client';

import { Card } from "@/components/ui/card";
import { BiPieChartAlt2 } from "react-icons/bi";
import { TbChartAreaLine } from "react-icons/tb";
import { FiUsers } from "react-icons/fi";
import { useTheme } from "next-themes";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  LineChart,
  Line
} from 'recharts';
import { DatePicker } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { startOfDay, endOfDay, format, isSameDay, subDays, subMonths, subYears } from 'date-fns';

interface ChartData {
  listingStatus: {
    label: string;
    value: number;
    color: string;
  }[];
  monthlyListings: {
    date: Date;
    month: string;
    count: number;
  }[];
  paymentStatus: {
    label: string;
    value: number;
    color: string;
  }[];
  maintenanceStatus: {
    label: string;
    value: number;
    color: string;
  }[];
  userCounts: {
    date: Date;
    label: string;
    month: string;
    counts: Record<UserRole, number>;
  }[];
}

interface DashboardChartsProps {
  data: ChartData;
}

type TimePeriod = 'week' | 'month' | 'year' | 'custom';
type UserRole = 'ADMIN' | 'TENANT' | 'LANDLORD' | 'USER';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#1e293b"
      textAnchor="middle" 
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-xl">
        <p className="font-medium text-sm">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Count: <span className="font-medium">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const generateLastSixMonths = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      count: 0
    });
  }
  return months;
};

const generateTimeRangeData = (period: TimePeriod, dateRange?: DateRange) => {
  let startDate = new Date();
  let endDate = new Date();
  
  if (dateRange?.from && dateRange?.to) {
    startDate = dateRange.from;
    endDate = dateRange.to;
  } else {
    switch (period) {
      case 'week':
        startDate = subDays(new Date(), 6); // Last 7 days
        break;
      case 'month':
        startDate = subMonths(new Date(), 1);
        break;
      case 'year':
        startDate = subYears(new Date(), 1);
        break;
    }
  }

  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    let label;
    if (period === 'week' || period === 'custom') {
      label = format(currentDate, 'MMM dd');
    } else if (period === 'month') {
      label = format(currentDate, 'MMM dd');
    } else {
      label = format(currentDate, 'MMM yyyy');
    }
    
    dates.push({
      date: new Date(currentDate),
      label,
    });

    if (period === 'week' || period === 'month' || period === 'custom') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return dates;
};

const formatDateForComparison = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const filterDataByDateRange = (data: any[], dateRange: DateRange) => {
  if (!dateRange.from || !dateRange.to) return data;
  
  return data.filter(item => {
    // Convert month string to date for comparison
    const [monthStr, year] = item.month.split(' ');
    const monthIndex = new Date(`${monthStr} 1`).getMonth();
    const itemDate = new Date(Number(year), monthIndex);
    return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
  });
};

const roleColors = {
  ADMIN: '#3b82f6',    // blue
  TENANT: '#22c55e',   // green
  LANDLORD: '#f59e0b', // amber
  USER: '#94a3b8'      // gray
};

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // Separate states for each chart
  const [listingPeriod, setListingPeriod] = useState<TimePeriod>('month');
  const [listingDateRange, setListingDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });

  // New states for user statistics
  const [userPeriod, setUserPeriod] = useState<TimePeriod>('month');
  const [userDateRange, setUserDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(
    ['ADMIN', 'TENANT', 'LANDLORD', 'USER']
  );
  const { theme } = useTheme();

  // Separate handlers for each chart
  const handleListingPeriodChange = (newPeriod: TimePeriod) => {
    setListingPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setListingDateRange({ from: undefined, to: undefined });
    }
  };

  const handleUserPeriodChange = (newPeriod: TimePeriod) => {
    setUserPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setUserDateRange({ from: undefined, to: undefined });
    }
  };

  // Get default date range based on period
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (listingPeriod) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return { from: listingDateRange.from, to: listingDateRange.to };
    }

    return { from: startDate, to: endDate };
  };

  // Use the actual date range or default based on period
  const effectiveDateRange = listingPeriod === 'custom' ? listingDateRange : getDefaultDateRange();

  const chartData = useMemo(() => {
    const timeRangeData = generateTimeRangeData(listingPeriod, listingDateRange);
    
    return timeRangeData.map(base => {
      let count = 0;
      
      if (listingPeriod === 'week' || listingPeriod === 'custom') {
        // For daily view, aggregate all listings for that day
        count = data.monthlyListings.filter(item => {
          const itemDate = new Date(item.date);
          return (
            itemDate.getFullYear() === base.date.getFullYear() &&
            itemDate.getMonth() === base.date.getMonth() &&
            itemDate.getDate() === base.date.getDate()
          );
        }).reduce((sum, item) => sum + item.count, 0);
      } else {
        // For monthly view, aggregate all listings in that month
        count = data.monthlyListings.filter(item => {
          const itemDate = new Date(item.date);
          return (
            itemDate.getFullYear() === base.date.getFullYear() &&
            itemDate.getMonth() === base.date.getMonth()
          );
        }).reduce((sum, item) => sum + item.count, 0);
      }
      
      return {
        ...base,
        count
      };
    });
  }, [listingPeriod, listingDateRange, data.monthlyListings]);

  // Update XAxis configuration for better label display
  const getXAxisConfig = (period: TimePeriod) => {
    const isCompactView = period === 'week' || period === 'custom' || period === 'month';
    return {
      angle: -45,
      textAnchor: 'end',
      height: 90,
      interval: 0,
      fontSize: 12,
      dy: 10,
      dx: -10,
    };
  };

  // Filter user data based on selected period and date range
  const filteredUserData = useMemo(() => {
    const timeRangeData = generateTimeRangeData(userPeriod, userDateRange);
    
    return timeRangeData.map(({ date, label }) => {
      const matchingData = data.userCounts.find(item => 
        isSameDay(new Date(item.date), date)
      );

      return {
        date,
        label,
        counts: matchingData?.counts || {
          ADMIN: 0,
          TENANT: 0,
          LANDLORD: 0,
          USER: 0
        }
      };
    });
  }, [data.userCounts, userPeriod, userDateRange]);

  // Custom tooltip for user statistics
  const UserStatsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-xl">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unfiltered Pie Chart */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <BiPieChartAlt2 className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Listing Status Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.listingStatus}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.listingStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="transition-opacity duration-200 hover:opacity-80"
                      strokeWidth={2}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={false}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Filtered Area Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TbChartAreaLine className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">Listing Trends</h3>
              </div>
              <select 
                className="bg-background text-sm border rounded-md px-2 py-1"
                onChange={(e) => handleListingPeriodChange(e.target.value as TimePeriod)}
                value={listingPeriod}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Date Range Filters - Only show for custom period */}
            {listingPeriod === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">From Date</label>
                  <DatePicker
                    date={listingDateRange.from}
                    onSelect={(date) => setListingDateRange(prev => ({ ...prev, from: date }))}
                    placeholder="Select start date"
                    disabledDates={(date) => 
                      Boolean(listingDateRange.to && date > listingDateRange.to) || date > new Date()
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">To Date</label>
                  <DatePicker
                    date={listingDateRange.to}
                    onSelect={(date) => setListingDateRange(prev => ({ ...prev, to: date }))}
                    placeholder="Select end date"
                    disabled={!listingDateRange.from}
                    disabledDates={(date) => 
                      date < (listingDateRange.from || new Date()) || date > new Date()
                    }
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setListingDateRange({ from: undefined, to: undefined })}
                  size="sm"
                  className="mt-6"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis 
                  dataKey="label" 
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  tick={{ fontSize: 12 }}
                  {...getXAxisConfig(listingPeriod)}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* New User Statistics Card - Full Width */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header with Title and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FiUsers className="h-5 w-5  text-indigo-500" />
              <h3 className="text-lg font-semibold">User Statistics</h3>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Role Filter */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(roleColors).map(([role, color]) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRoles(prev => 
                        prev.includes(role as UserRole)
                          ? prev.filter(r => r !== role)
                          : [...prev, role as UserRole]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                      ${selectedRoles.includes(role as UserRole)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Time Period Selector */}
              <select 
                className="bg-background text-sm border rounded-md px-2 py-1"
                onChange={(e) => handleUserPeriodChange(e.target.value as TimePeriod)}
                value={userPeriod}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Date Range Filters - Only show for custom period */}
          {userPeriod === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">From Date</label>
                <DatePicker
                  date={userDateRange.from}
                  onSelect={(date) => setUserDateRange(prev => ({ ...prev, from: date }))}
                  placeholder="Select start date"
                  disabledDates={(date) => 
                    Boolean(userDateRange.to && date > userDateRange.to) || date > new Date()
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">To Date</label>
                <DatePicker
                  date={userDateRange.to}
                  onSelect={(date) => setUserDateRange(prev => ({ ...prev, to: date }))}
                  placeholder="Select end date"
                  disabled={!userDateRange.from}
                  disabledDates={(date) => 
                    date < (userDateRange.from || new Date()) || date > new Date()
                  }
                />
              </div>

              <Button 
                variant="outline" 
                onClick={() => setUserDateRange({ from: undefined, to: undefined })}
                size="sm"
                className="mt-6"
              >
                Clear
              </Button>
            </div>
          )}

          {/* Line Chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={filteredUserData}
                margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} 
                />
                <XAxis
                  dataKey="label"
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  tick={{
                    ...getXAxisConfig(userPeriod),
                    fill: theme === 'dark' ? '#94a3b8' : '#64748b',
                  }}
                  tickMargin={20}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  tick={{ 
                    fontSize: 12,
                    fill: theme === 'dark' ? '#94a3b8' : '#64748b',
                  }}
                  allowDecimals={false}
                />
                <Tooltip content={<UserStatsTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
                {selectedRoles.map((role) => (
                  <Line
                    key={role}
                    type="monotone"
                    dataKey={`counts.${role}`}
                    name={role.charAt(0) + role.slice(1).toLowerCase()}
                    stroke={roleColors[role]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
} 
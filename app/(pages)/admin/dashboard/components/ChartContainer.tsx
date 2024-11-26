import { Suspense } from 'react';
import DashboardCharts from './DashboardCharts';
import LoadingState from './loading';
import getDashboardChartData from '@/app/actions/getDashboardChartData';

export default async function ChartContainer() {
  const chartData = await getDashboardChartData();
  
  return (
    <div className="mb-6">
      <Suspense fallback={<LoadingState />}>
        <DashboardCharts data={chartData} />
      </Suspense>
    </div>
  );
} 
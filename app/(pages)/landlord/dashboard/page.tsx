import { Suspense } from 'react';
import LoadingState from '@/app/components/LoadingState';
import DashboardContent from './components/DashboardContent';

export default function Dashboard() {
  return (
    <div className="">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
        </div>

        <Suspense fallback={<LoadingState />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}

'use client';

import { IconType } from 'react-icons';

interface TenantStatsProps {
  icon: IconType;
  label: string;
  value: string | number;
}

const TenantStats = ({
  icon: Icon,
  label,
  value
}: TenantStatsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {value}
          </p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </div>
  );
};

export default TenantStats; 
import { IconType } from 'react-icons';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon,
  description,
  trend 
}: DashboardCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-indigo-50 rounded-full">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
      {description && (
        <p className="mt-4 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default DashboardCard; 
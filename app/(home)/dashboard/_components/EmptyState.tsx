'use client';

import { IconType } from "react-icons";
import { LuHome, LuHistory, LuWrench } from "react-icons/lu";

interface EmptyStateProps {
  type: 'lease' | 'payment' | 'maintenance';
  title?: string;
  subtitle?: string;
  showReset?: boolean;
  onReset?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  subtitle,
  showReset,
  onReset,
}) => {
  const config: Record<string, { icon: IconType; defaultTitle: string; defaultSubtitle: string; }> = {
    lease: {
      icon: LuHome,
      defaultTitle: "No active lease found",
      defaultSubtitle: "You currently don't have any active lease agreements."
    },
    payment: {
      icon: LuHistory,
      defaultTitle: "No payment history",
      defaultSubtitle: "Your payment history will appear here once you make payments."
    },
    maintenance: {
      icon: LuWrench,
      defaultTitle: "No maintenance requests",
      defaultSubtitle: "You haven't submitted any maintenance requests yet."
    }
  };

  const Icon = config[type].icon;

  return (
    <div className="min-h-[200px] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-gray-50 rounded-full mb-4">
          <Icon className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title || config[type].defaultTitle}
        </h3>
        <p className="text-gray-500 max-w-sm mb-6">
          {subtitle || config[type].defaultSubtitle}
        </p>
        {showReset && (
          <button
            onClick={onReset}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 
              bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            Reset View
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState; 
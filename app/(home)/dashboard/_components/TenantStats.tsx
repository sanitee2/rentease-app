'use client';

import { IconType } from 'react-icons';
import { HiInformationCircle } from 'react-icons/hi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TenantStatsProps {
  icon: IconType;
  label: string;
  value: string;
  description?: string;
}

const TenantStats = ({
  icon: Icon,
  label,
  value,
  description
}: TenantStatsProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <span className="text-sm font-medium text-gray-600">
          {label}
        </span>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ml-auto relative">
                  <HiInformationCircle className="w-5 h-5 text-indigo-400 hover:text-indigo-600 transition-colors animate-pulse" />
                  <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400/30" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-2xl font-semibold text-gray-900">
          {value}
        </div>
      </div>
    </div>
  );
};

export default TenantStats; 
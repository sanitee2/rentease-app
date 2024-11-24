'use client';

import React from 'react';
import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';

interface ListingCategoryProps {
  icon: string;
  label: string;
  description: string;
}

const ListingCategory: React.FC<ListingCategoryProps> = ({
  icon,
  label,
  description
}) => {
  const Icon: IconType = FaIcons[icon as keyof typeof FaIcons] || FaIcons.FaHome;

  return (
    <div className="
      flex 
      flex-col 
      gap-4 
      rounded-xl 
      border-indigo-100 
      transition-all 
      duration-200
    ">
      <div className="flex items-center gap-4">
        <div className="
          p-3 
          rounded-lg 
          bg-indigo-100 
          text-indigo-600
          shadow-sm
          shadow-indigo-100/50
        ">
          <Icon size={24} />
        </div>
        <div className="flex flex-col">
          <h3 className="
            text-lg 
            font-semibold 
            text-gray-900
            tracking-tight
          ">
            {label}
          </h3>
          <p className="
            text-sm 
            text-gray-600
            leading-relaxed
            mt-1
          ">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingCategory;
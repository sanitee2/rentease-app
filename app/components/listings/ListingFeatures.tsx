'use client';

import React from 'react';
import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';

// Update interfaces to match the schema
interface PropertyAmenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

interface ListingOnAmenities {
  id: string;
  amenity: PropertyAmenity;
  note?: string | null;
}

interface ListingFeaturesProps {
  genderRestriction: string;
  amenities: ListingOnAmenities[];
}

const getGenderIcon = (restriction: string) => {
  switch (restriction?.toUpperCase()) {
    case 'MEN_ONLY':
      return {
        icon: FaMars,
        label: 'Male tenants only',
        iconClass: 'text-blue-600',
        bgClass: 'bg-blue-50 hover:bg-blue-100'
      };
    case 'LADIES_ONLY':
      return {
        icon: FaVenus,
        label: 'Female tenants only',
        iconClass: 'text-pink-600',
        bgClass: 'bg-pink-50 hover:bg-pink-100'
      };
    default: // BOTH
      return {
        icon: FaVenusMars,
        label: 'All genders welcome',
        iconClass: 'text-purple-600',
        bgClass: 'bg-purple-50 hover:bg-purple-100'
      };
  }
};

const ListingFeatures: React.FC<ListingFeaturesProps> = ({
  genderRestriction,
  amenities
}) => {
  const { icon: GenderIcon, label: genderLabel, iconClass, bgClass } = getGenderIcon(genderRestriction);

  return (
    <div className="relative flex items-center gap-2 mt-3">
      {/* Gender Circle with Tooltip */}
      <div className="relative group/tooltip">
        <div className={`
          flex-shrink-0
          p-2
          rounded-full
          transition-colors
          ${bgClass}
        `}>
          <GenderIcon size={14} className={iconClass} />
        </div>
        {/* Tooltip */}
        <div className="
          pointer-events-none
          absolute 
          left-1/2 
          -translate-x-1/2 
          top-full 
          mt-2
          px-3 
          py-2 
          bg-white 
          text-indigo-600
          text-sm 
          font-medium 
          rounded-lg 
          shadow-md
          border
          border-indigo-100
          whitespace-nowrap
          opacity-0
          invisible
          group-hover/tooltip:opacity-100
          group-hover/tooltip:visible
          transition-all
          duration-200
          z-[60]
        ">
          {genderLabel}
          <div className="
            absolute 
            -top-1.5
            left-1/2 
            -translate-x-1/2 
            border-[6px] 
            border-transparent 
            border-b-white
          "/>
        </div>
      </div>

      {/* Amenities Icons with Tooltips */}
      {amenities.map(({ id, amenity }) => {
        const Icon: IconType = FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaHome;
        
        return (
          <div key={id} className="relative group/tooltip">
            <div className="
              flex-shrink-0
              p-2
              rounded-full
              bg-gray-50
              hover:bg-gray-100
              transition-colors
            ">
              <Icon size={14} className="text-gray-600" />
            </div>
            {/* Tooltip */}
            <div className="
              pointer-events-none
              absolute 
              left-1/2 
              -translate-x-1/2 
              top-full 
              mt-2
              px-3 
              py-2 
              bg-white 
              text-indigo-600
              text-sm 
              font-medium 
              rounded-lg 
              shadow-md
              border
              border-indigo-100
              whitespace-nowrap
              opacity-0
              invisible
              group-hover/tooltip:opacity-100
              group-hover/tooltip:visible
              transition-all
              duration-200
              z-[60]
            ">
              {amenity.title}
              <div className="
                absolute 
                -top-1.5
                left-1/2 
                -translate-x-1/2 
                border-[6px] 
                border-transparent 
                border-b-white
              "/>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListingFeatures;

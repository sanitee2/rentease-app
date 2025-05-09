'use client';

import { SafeRoom, SafeUser } from '@/app/types';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { FaPesoSign, FaUsers } from 'react-icons/fa6';
import Button from '../Button';
import CategoryListing from '../listings/CategoryListing';
import * as FaIcons from 'react-icons/fa';
import { getIconComponent } from '@/app/libs/utils';
import { IconType } from 'react-icons';
import { Badge } from "@/components/ui/badge";

interface RoomCardProps {
  data: SafeRoom & {
    tenants: { id: string }[];
    listing: {
      pricingType: 'ROOM_BASED' | 'LISTING_BASED';
    };
  };
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
  onClick?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  data,
  onAction,
  disabled,
  actionLabel,
  actionId = '',
  currentUser,
  onClick,
}) => {
  const isRoomFull = data.maxTenantCount && data.tenants.length >= data.maxTenantCount;

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onAction?.(actionId);
    },
    [onAction, actionId, disabled]
  );

  // Function to get icon component (similar to ListingInfo)
  const getIcon = (iconName: string): IconType => {
    return FaIcons[iconName as keyof typeof FaIcons] || FaIcons.FaQuestion;
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white transition hover:shadow-lg border border-gray-100 cursor-pointer"
    >
      {/* Occupied Badge - Full Width */}
      {isRoomFull && (
        <div className="absolute inset-x-0 top-0 z-10">
          <Badge 
            variant="destructive" 
            className="w-full rounded-none px-0 py-1.5 flex items-center justify-center font-medium"
          >
            Occupied
          </Badge>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          alt="room"
          src={data.imageSrc.images[0]}
          fill
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Bottom Badges */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <CategoryListing category={data.roomCategory} />
          {data.listing.pricingType === 'ROOM_BASED' && data.maxTenantCount && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1.5 bg-black/50 hover:bg-black/60 text-white"
            >
              <FaUsers size={14} />
              <span className="text-sm font-medium">
                {data.tenants.length}/{data.maxTenantCount}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {data.title}
            </h3>
          </div>

          {/* Price Section */}
          {data.pricingType !== 'LISTING_BASED' && data.price && (
            <div className="flex items-center gap-1">
              <div className="px-3 py-1.5 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-1 text-indigo-700">
                  <FaPesoSign size={13} className="flex-shrink-0" />
                  <span className="font-semibold">{data.price.toLocaleString('en-US')}</span>
                  <span className="text-indigo-500 text-sm font-normal">/month</span>
                </div>
              </div>
            </div>
          )}

          {/* Amenities Preview */}
          {data.amenities && data.amenities.length > 0 && (
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                {data.amenities.slice(0, 3).map((amenity) => (
                  <div 
                    key={amenity.amenity.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md"
                  >
                    {React.createElement(getIcon(amenity.amenity.icon), { 
                      size: 12,
                      className: "text-gray-600" 
                    })}
                    <span className="text-xs text-gray-600">
                      {amenity.amenity.title}
                    </span>
                  </div>
                ))}
                {data.amenities.length > 3 && (
                  <div className="px-2 py-1 bg-gray-100 rounded-md">
                    <span className="text-xs text-gray-600">
                      +{data.amenities.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {onAction && actionLabel && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button 
              disabled={disabled} 
              small 
              label={actionLabel} 
              onClick={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;

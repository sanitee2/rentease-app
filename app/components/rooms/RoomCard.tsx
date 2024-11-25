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

interface RoomCardProps {
  data: SafeRoom;
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
      className="group cursor-pointer overflow-hidden rounded-xl border bg-white transition hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          alt="room"
          src={data.imageSrc.images[0]}
          fill
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute bottom-4 right-4">
          <CategoryListing category={data.roomCategory} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{data.title}</h3>
        
        <div className="mt-2 flex items-center justify-between">
          {/* Only show price if it's a room AND the listing is not listing-based pricing */}
          {data.pricingType !== 'LISTING_BASED' && data.price && (
            <div className="flex items-center gap-1 text-lg font-semibold text-indigo-600">
              <FaPesoSign size={14} />
              <span>{data.price.toLocaleString('en-US')}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          )}
          
          {data.maxTenantCount && (
            <div className="flex items-center gap-1 text-gray-500">
              <FaUsers size={14} />
              <span className="text-sm">
                {data.currentTenants.length}/{data.maxTenantCount}
              </span>
            </div>
          )}
        </div>

        {/* Add Amenities Section */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {data.amenities.length} amenities
            </div>
          </div>
        )}

        {onAction && actionLabel && (
          <div className="mt-4">
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

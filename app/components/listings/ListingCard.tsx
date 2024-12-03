'use client';

import useCountries from '@/app/hooks/useCountries';
import { SafeListing, SafeRoom, SafeUser } from '@/app/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import HeartButton from './HeartButton';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import Button from '../../components/Button';
import CategoryListing from './CategoryListing';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { FaPesoSign } from 'react-icons/fa6';
import ListingFeatures from './ListingFeatures';
import '@/app/styles/slick-carousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { cn } from '@/lib/utils';
import { FaCircle } from 'react-icons/fa';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SimpleRoom {
  id: string;
  title: string;
  price: number | null;
  maxTenantCount: number | null;
  currentTenants: string[];
}

interface LeaseContract {
  id: string;
  status: 'ACTIVE' | 'PENDING' | 'DECLINED' | 'ARCHIVED';
  roomId?: string | null;
  listingId?: string | null;
}

interface ListingCardProps {
  data: {
    id: string;
    title: string;
    description: string;
    imageSrc: {
      images: string[];
    };
    category: string;
    roomCount: number;
    locationValue: {
      latlng: number[];
    };
    street: string;
    barangay: string;
    status: 'PENDING' | 'ACTIVE' | 'DECLINED' | 'ARCHIVED';
    price?: number;
    pricingType: 'ROOM_BASED' | 'LISTING_BASED';
    maxGuests?: number;
    hasAgeRequirement: boolean;
    minimumAge?: number;
    genderRestriction: string;
    overnightGuestsAllowed: boolean;
    hasMaxTenantCount: boolean;
    maxTenantCount?: number;
    rooms: SimpleRoom[];
    rules?: {
      petsAllowed: boolean;
      childrenAllowed: boolean;
      smokingAllowed: boolean;
      additionalNotes?: string;
    };
    createdAt: string;
    updatedAt: string;
    propertyAmenities: {
      id: string;
      amenity: {
        id: string;
        title: string;
        icon: string;
        desc: string;
      };
      note?: string | null;
    }[];
    leaseContracts: {
      id: string;
      status: 'ACTIVE' | 'PENDING' | 'DECLINED' | 'ARCHIVED';
      roomId: string | null;
      listingId: string | null;
    }[];
  };

  currentUser: SafeUser | null | undefined;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
}




const ListingCard: React.FC<ListingCardProps> = ({
  data,
  currentUser,
  onAction,
  disabled,
  actionLabel,
  actionId = '',
}) => {
  const router = useRouter();

  

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      onAction?.(actionId);
    },
    [onAction, actionId, disabled]
  );

  // Calculate price range from the rooms data
  const priceRange = useMemo(() => {
    if (data.pricingType === 'LISTING_BASED') {
      return data.price ? `${data.price.toLocaleString('en-US')}` : null;
    }

    if (!data.rooms || data.rooms.length === 0) {
      return null;
    }

    const prices = data.rooms
      .map((room) => room.price)
      .filter((price): price is number => price !== undefined && price !== null);

    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return minPrice === maxPrice
      ? `${minPrice.toLocaleString('en-US')}`
      : `${minPrice.toLocaleString('en-US')} - ${maxPrice.toLocaleString('en-US')}`;
  }, [data]);

  // Custom arrow components for the slider
  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8",
          "bg-white/90 backdrop-blur-sm rounded-full",
          "flex items-center justify-center shadow-md",
          "hover:bg-indigo-50 transition-colors",
          // Show on mobile, hide on desktop until hover
          "md:opacity-0 md:group-hover:opacity-100"
        )}
        aria-label="Previous slide"
      >
        <MdArrowBackIos size={16} className="text-indigo-600 ml-1.5" />
      </button>
    );
  };

  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8",
          "bg-white/90 backdrop-blur-sm rounded-full",
          "flex items-center justify-center shadow-md",
          "hover:bg-indigo-50 transition-colors",
          // Show on mobile, hide on desktop until hover
          "md:opacity-0 md:group-hover:opacity-100"
        )}
        aria-label="Next slide"
      >
        <MdArrowForwardIos size={16} className="text-indigo-600" />
      </button>
    );
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    customPaging: () => (
      <div className="w-1.5 h-1.5 mx-0.5 rounded-full bg-indigo-200/80 hover:bg-indigo-300/80 transition-all duration-200" />
    ),
  };

  // Add this function to check availability
  const getAvailabilityInfo = () => {
    try {
      if (data.pricingType === 'LISTING_BASED') {
        const activeLeases = data.leaseContracts?.filter(lease => 
          lease.status === 'ACTIVE' && lease.listingId === data.id
        ) || [];
        
        const isAvailable = activeLeases.length === 0;
        return {
          available: isAvailable,
          tooltip: isAvailable ? 'Available' : 'Occupied'
        };
      }

      // For room-based listings
      if (!data.rooms || data.rooms.length === 0) {
        return {
          available: false,
          tooltip: 'No rooms available'
        };
      }

      // Count rooms with available capacity
      const roomAvailability = data.rooms.reduce((acc, room) => {
        // Check if room has active lease
        const hasActiveLease = data.leaseContracts?.some(lease => 
          lease.status === 'ACTIVE' && lease.roomId === room.id
        ) || false;

        // Count current tenants and check capacity
        const currentTenants = room.currentTenants?.length || 0;
        const maxTenants = room.maxTenantCount || 1;
        
        // Room is available if it has space for more tenants
        if (currentTenants < maxTenants) {
          const availableSpots = maxTenants - currentTenants;
          acc.availableRooms++;
          acc.totalAvailableSpots += availableSpots;
        }
        
        return acc;
      }, { availableRooms: 0, totalAvailableSpots: 0 });

      const { availableRooms, totalAvailableSpots } = roomAvailability;

      if (availableRooms === 0) {
        return {
          available: false,
          tooltip: 'No rooms available'
        };
      }

      // Create a detailed tooltip message
      const roomText = `${availableRooms} room${availableRooms !== 1 ? 's' : ''}`;
      const spotText = `${totalAvailableSpots} spot${totalAvailableSpots !== 1 ? 's' : ''}`;
      
      return {
        available: true,
        tooltip: `${roomText} available (${spotText})`
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        available: false,
        tooltip: 'Status unavailable'
      };
    }
  };

  const availabilityInfo = getAvailabilityInfo();

  return (
    <div 
      onClick={() => router.push(`/listings/info/${data.id}`)} 
      className="col-span-1 cursor-pointer group bg-white rounded-xl transition-all duration-300"
    >
      {/* Image Slider Container */}
      <div className="h-56 w-full relative overflow-hidden">
        <Slider {...settings}>
          {data.imageSrc.images.map((image, index) => (
            <div key={index} className="h-56 w-full relative rounded-md">
              <Image
                alt={`listing-${index + 1}`}
                src={image}
                fill
                className="object-cover w-full"
              />
            </div>
          ))}
        </Slider>
        
        {/* Top Badges Container */}
        <div className="absolute top-4 left-0 right-0 px-4 z-10">
          <div className="flex items-start justify-between">
            <CategoryListing category={data.category} />
            <div className="flex items-center gap-2">
              {/* Availability Badge */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "w-4 h-4 relative",
                        "bg-white rounded-full shadow-md",
                        "flex items-center justify-center",
                        "transition hover:scale-110"
                      )}
                    >
                      <FaCircle 
                        size={8} 
                        className={cn(
                          "transition-colors",
                          availabilityInfo.available 
                            ? "text-green-500" 
                            : "text-red-500"
                        )} 
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{availabilityInfo.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <HeartButton listingId={data.id} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 relative">
        {/* Primary Information */}
        <div className="space-y-4">
          {/* Title and Gender Restriction */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {data.title}
            </h3>
          </div>

          {/* Location and Price Info */}
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
              <p className="text-sm leading-tight">
                Brgy. {data.barangay}, {data.street}
              </p>
            </div>

            {/* Price Range */}
            {priceRange && (
              <div className="flex items-center gap-1">
                <div className="px-3 py-1.5 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-1 text-indigo-700">
                    <FaPesoSign size={13} className="flex-shrink-0" />
                    <span className="font-semibold">{priceRange}</span>
                    <span className="text-indigo-500 text-sm font-normal">/month</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <ListingFeatures 
            genderRestriction={data.genderRestriction}
            amenities={data.propertyAmenities}
          />
        </div>

        {/* Action Button */}
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

export default ListingCard;

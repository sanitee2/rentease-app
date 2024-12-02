'use client';

import useCountries from '@/app/hooks/useCountries';
import { SafeListing, SafeRoom, SafeUser } from '@/app/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';
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

interface Room {
  id: string;
  title: string;
  description: string;
  imageSrc: {
    images: string[];
  };
  price?: number;
  roomCategory: string;
  maxTenantCount?: number;
  currentTenants: string[];
  tenants: { id: string }[];
  amenities: {
    amenity: {
      id: string;
      title: string;
      icon: string;
      desc: string;
    };
  }[];
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
    rooms: Room[];
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
    if (data.pricingType === 'LISTING_BASED') {
      // Check if there are any active lease contracts
      const isAvailable = !data.leaseContracts || data.leaseContracts.filter(
        lease => lease.status === 'ACTIVE'
      ).length === 0;
      return {
        available: isAvailable,
        tooltip: isAvailable ? 'Available' : 'Occupied'
      };
    } else {
      const availableRooms = data.rooms.filter(room => 
        !room.maxTenantCount || 
        (room.tenants?.length || 0) < room.maxTenantCount
      ).length;
      return {
        available: availableRooms > 0,
        tooltip: `${availableRooms} room${availableRooms !== 1 ? 's' : ''} available`
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
        
        {/* Badges Container */}
        <div className="absolute top-4 left-0 right-0 px-4 z-10">
          <div className="flex items-start justify-between">
            {/* Left side badges */}
            <div className="flex items-center gap-2">
              <CategoryListing category={data.category} />
              {/* Gender Restriction Icon with Tooltip */}
              
            </div>
            {/* Heart button */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FaCircle 
                      size={16} 
                      className={cn(
                        "transition-colors",
                        availabilityInfo.available 
                          ? "text-green-500 hover:text-green-600" 
                          : "text-red-500 hover:text-red-600"
                      )} 
                    />
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
      <div className="p-4">
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

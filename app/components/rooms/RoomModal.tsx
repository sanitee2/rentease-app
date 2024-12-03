'use client';

import { SafeRoom } from '@/app/types';
import Image from 'next/image';
import React, { useState } from 'react';
import Modal from '../Modals/Modal';
import FullScreenGallery from '../FullScreenGallery';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaUsers } from 'react-icons/fa';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import * as FaIcons from 'react-icons/fa';
import { IconType } from 'react-icons';
import { getIconComponent } from '@/app/libs/utils';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: SafeRoom & {
    tenants: { id: string }[];
    listing: {
      pricingType: 'ROOM_BASED' | 'LISTING_BASED';
    };
  };
  onRequestViewing?: (roomId: string) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, roomData, onRequestViewing }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isRoomFull = roomData.maxTenantCount && roomData.tenants.length >= roomData.maxTenantCount;

  // Custom arrows for the slider
  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-50 transition-colors group"
        aria-label="Previous slide"
      >
        <MdArrowBackIos size={20} className="text-indigo-600 ml-1.5" />
      </button>
    );
  };

  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-50 transition-colors group"
        aria-label="Next slide"
      >
        <MdArrowForwardIos size={20} className="text-indigo-600" />
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
    adaptiveHeight: true,
    customPaging: () => (
      <div className="w-2.5 h-2.5 mx-1 rounded-full bg-indigo-200 hover:bg-indigo-300 transition-all duration-200" />
    ),
    afterChange: (index: number) => setCurrentSlideIndex(index),
  };

  const sliderStyles = `
    .slick-dots {
      bottom: 16px;
      z-index: 20;
    }
    .slick-dots li {
      margin: 0 4px;
    }
    .slick-dots li.slick-active div {
      background-color: #4F46E5; /* indigo-600 */
      transform: scale(1.2);
    }
  `;

  // Function to get icon component
  const getIcon = (iconName: string): IconType => {
    return FaIcons[iconName as keyof typeof FaIcons] || FaIcons.FaQuestion;
  };

  const bodyContent = (
    <div className="flex flex-col gap-8">
      <style>{sliderStyles}</style>
      
      {/* Image Slider */}
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
        {isRoomFull && (
          <div className="absolute inset-x-0 top-0 z-20">
            <Badge 
              variant="destructive" 
              className="w-full rounded-none px-0 py-2 flex items-center justify-center font-medium text-base"
            >
              Not Available
            </Badge>
          </div>
        )}
        <Slider {...settings}>
          {roomData.imageSrc.images.map((image, index) => (
            <div key={index} onClick={() => setIsFullScreen(true)}>
              <div className="relative h-[400px] cursor-zoom-in">
                <Image
                  src={image}
                  alt={`Room ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Room Details */}
      <div className="space-y-8">
        {/* Basic Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50/80 p-5 rounded-xl space-y-4">
            <h3 className="font-semibold text-gray-900">Room Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category</span>
                <Badge variant="outline" className="font-medium">
                  {roomData.roomCategory}
                </Badge>
              </div>
              {roomData.pricingType !== 'LISTING_BASED' && roomData.price && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <div className="text-indigo-600 font-semibold">
                    ₱{roomData.price.toLocaleString('en-US')}/month
                  </div>
                </div>
              )}
            </div>
          </div>

          {roomData.listing.pricingType === 'ROOM_BASED' && (
            <div className="bg-gray-50/80 p-5 rounded-xl space-y-4">
              <h3 className="font-semibold text-gray-900">Occupancy</h3>
              <div className="space-y-3">
                {roomData.maxTenantCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Max Tenants</span>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-gray-400" />
                      <span className="font-medium">{roomData.maxTenantCount}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Tenants</span>
                  <Badge variant={isRoomFull ? "destructive" : "secondary"}>
                    {roomData.tenants.length} occupied
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-gray-50/80 p-5 rounded-xl space-y-3">
          <h3 className="font-semibold text-gray-900">Description</h3>
          <div 
            className="text-gray-600 leading-relaxed prose prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: roomData.description }}
          />
        </div>

        {/* Room Amenities */}
        {roomData.amenities && roomData.amenities.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Room Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roomData.amenities.map((item) => {
                const Icon = getIcon(item.amenity.icon);
                return (
                  <div 
                    key={item.amenity.id}
                    className={cn(
                      "rounded-xl border p-4 flex items-start gap-3",
                      "hover:border-indigo-600/20 hover:bg-indigo-50/50 transition",
                      "border-gray-100"
                    )}
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                      <Icon size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.amenity.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.amenity.desc}
                      </p>
                      {item.note && (
                        <p className="text-sm italic text-indigo-600 mt-2">
                          Note: {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const handleRequestViewing = () => {
    if (onRequestViewing) {
      onRequestViewing(roomData.id);
      onClose();
    }
  };

  return (
    <>
      {isFullScreen ? (
        <FullScreenGallery 
          images={roomData.imageSrc.images} 
          onClose={() => setIsFullScreen(false)}
          initialIndex={currentSlideIndex}
        />
      ) : (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={
            !isRoomFull && 
            roomData.listing.pricingType === 'ROOM_BASED' 
              ? handleRequestViewing 
              : undefined
          }
          actionLabel={
            !isRoomFull && 
            roomData.listing.pricingType === 'ROOM_BASED' 
              ? "Request Viewing" 
              : undefined
          }
          secondaryActionLabel="Close"
          secondaryAction={onClose}
          title={roomData.title}
          body={bodyContent}
          className="max-w-3xl"
        />
      )}
    </>
  );
};

export default RoomModal;

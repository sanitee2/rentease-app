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
import { getIconComponent } from '@/lib/utils';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: SafeRoom;
  onRequestViewing?: (roomId: string) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, roomData, onRequestViewing }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

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
    <div className="flex flex-col gap-6">
      <style>{sliderStyles}</style>
      
      {/* Image Slider */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
        <Slider {...settings}>
          {roomData.imageSrc.images.map((image, index) => (
            <div key={index} onClick={() => setIsFullScreen(true)}>
              <div className="relative h-[400px] cursor-pointer group">
                <Image
                  src={image}
                  alt={`Room ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {/* Dark overlay for better dot visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Room Details */}
      <div className="space-y-6">
        {/* Basic Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Category</span>
            <span className="font-medium">{roomData.roomCategory}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Price</span>
            <span className="font-medium text-indigo-600">
              ₱{roomData.price.toLocaleString('en-US')}/month
            </span>
          </div>
          {roomData.maxTenantCount && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Max Tenants</span>
              <div className="flex items-center gap-2">
                <FaUsers className="text-gray-400" />
                <span>{roomData.maxTenantCount}</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Current Tenants</span>
            <span>{roomData.currentTenants.length}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {roomData.description}
          </p>
        </div>

        {/* Room Amenities */}
        {roomData.amenities && roomData.amenities.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Room Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roomData.amenities.map((item) => {
                const Icon = getIcon(item.amenity.icon);
                
                return (
                  <div 
                    key={item.amenity.id}
                    className="
                      rounded-xl
                      border
                      p-4
                      flex
                      items-start
                      gap-3
                      hover:border-indigo-800
                      hover:bg-indigo-50
                      transition
                      border-neutral-200
                    "
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Icon 
                        size={20} 
                        className="text-indigo-600"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.amenity.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.amenity.desc}
                      </p>
                      {item.note && (
                        <p className="text-sm italic text-indigo-600 mt-1">
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
        />
      ) : (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleRequestViewing}
          actionLabel="Request Viewing"
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

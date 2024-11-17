'use client';

import useCountries from '@/app/hooks/useCountries';
import { SafeUser, SafeRoom } from '@/app/types';
import React, { useState } from 'react';
import { IconType } from 'react-icons';
import Avatar from '../../components/Avatar';
import ListingCategory from './ListingCategory';
import dynamic from 'next/dynamic';
import Heading from '../Heading';
import GoogleMapComponent from '../GoogleMapComponent';
import RoomCard from '../rooms/RoomCard';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import RoomModal from '../rooms/RoomModal';
import HouseRules from './HouseRules';
import DOMPurify from 'dompurify';
import * as FaIcons from 'react-icons/fa';
import { getIconComponent } from '@/lib/utils';

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
});

interface ListingInfoProps {
  title: string;
  user: SafeUser;
  category: {
    icon: IconType;
    label: string;
    description: string;
  } | undefined;
  description: string;
  roomCount: number;
  locationValue: number[];
  barangay: string;
  street: string;
  rooms: SafeRoom[];
  contactNumber?: string;
  onRoomSelect: (roomId: string, roomTitle: string) => void;
  hasAgeRequirement: boolean;
  minimumAge?: number | null;
  overnightGuestsAllowed: boolean;
  rules: {
    petsAllowed: boolean;
    childrenAllowed: boolean;
    smokingAllowed: boolean;
    additionalNotes?: string | null;
  };
  propertyAmenities: {
    amenity: {
      id: string;
      title: string;
      icon: string;
      desc: string;
    };
    note: string | null;
  }[];
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  title,
  category,
  description,
  roomCount,
  locationValue,
  barangay,
  street,
  rooms,
  contactNumber,
  onRoomSelect,
  hasAgeRequirement,
  minimumAge,
  overnightGuestsAllowed,
  rules,
  propertyAmenities,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<SafeRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoomClick = (room: SafeRoom) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleRequestViewing = (roomId: string) => {
    const selectedRoom = rooms.find(room => room.id === roomId);
    if (selectedRoom) {
      onRoomSelect(roomId, selectedRoom.title);
      
      // Scroll to the booking section
      const bookingSection = document.querySelector('#booking-section');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Update the custom arrows
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

  // Update the slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    customPaging: () => (
      <div className="w-2.5 h-2.5 mx-1 rounded-full bg-indigo-200 hover:bg-indigo-300 transition-all duration-200" />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Add this style block inside the return statement, before the main div
  const sliderStyles = `
    .slick-dots {
      bottom: -32px;
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

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return {
      __html: DOMPurify.sanitize(htmlContent)
    };
  };

  // Function to get icon component
  const getIcon = (iconName: string): IconType => {
    return FaIcons[iconName as keyof typeof FaIcons] || FaIcons.FaQuestion;
  };

  return (
    <div className="col-span-5 flex flex-col gap-6">
      {/* Header Section - Remove host info */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <Heading title={title} subtitle={`${street}, Barangay ${barangay}, Surigao City`} />
          </div>
          <div>
            {category && (
              <ListingCategory
                icon={category.icon}
                label={category.label}
                description={category.description}
              />
            )}
          </div>
        </div>
      </section>

      {/* Property Details Section */}
      <section className="bg-white rounded-lg p-6 shadow-sm space-y-8">
        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div 
            className="prose prose-sm text-gray-600 max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-600"
            dangerouslySetInnerHTML={createMarkup(description)}
          />
        </div>

        {/* Property Amenities */}
        <div className="pt-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Property Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyAmenities.map((item) => {
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
      </section>

      {/* Rooms Section */}
      <section className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Available Rooms</h2>
        <div className="relative w-full">
          {rooms.length >= 3 ? (
            <div className="pb-8 w-full">
              <style>{sliderStyles}</style>
              <Slider {...settings}>
                {rooms.map((room) => (
                  <div key={room.id} className="px-1">
                    <RoomCard 
                      data={room} 
                      currentUser={user} 
                      onClick={() => handleRoomClick(room)}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  data={room} 
                  currentUser={user} 
                  onClick={() => handleRoomClick(room)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rooms available for this listing.
            </div>
          )}
        </div>
      </section>

      {/* Host Information - New Section */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Host Information</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={user?.image} />
            <div>
              <h3 className="font-medium text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">Property Host</p>
            </div>
          </div>
          
          {contactNumber && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Number</h4>
              <div className="flex items-center gap-2 text-gray-600">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                  />
                </svg>
                <span>{contactNumber}</span>
              </div>
            </div>
          )}

          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">About the Host</h4>
            <p className="text-sm text-gray-600">
              Member since {new Date(user?.createdAt).getFullYear()}
            </p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <GoogleMapComponent lat={locationValue[0]} lng={locationValue[1]} />
        </div>
      </section>

      {/* House Rules Section */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <HouseRules 
          rules={rules}
          hasAgeRequirement={hasAgeRequirement}
          minimumAge={minimumAge}
          overnightGuestsAllowed={overnightGuestsAllowed}
        />
      </section>

      {/* Room Modal */}
      {selectedRoom && (
        <RoomModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          roomData={selectedRoom}
          onRequestViewing={handleRequestViewing}
        />
      )}
    </div>
  );
};

export default ListingInfo;

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
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { MdPhone, MdEmail } from 'react-icons/md';
import Button from '../../components/Button';
import useLoginModal from '@/app/hooks/useLoginModal';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
});

interface GenderRestrictionInfo {
  icon: IconType;
  label: string;
  className: string;
}

interface ListingInfoProps {
  title: string;
  user: SafeUser;
  category: {
    id: string;
    title: string;
    icon: string;
    desc: string;
    needsMaxTenant: boolean;
    pricingType: string;
    roomTypes: string[];
  } | null;
  description: string;
  roomCount: number;
  locationValue: number[];
  barangay: string;
  street: string;
  rooms: SafeRoom[];
  contactNumber?: string | null;
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
  currentUser: SafeUser | null | undefined;
  userEmail: string | null | undefined;
  genderRestriction: string;
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
  currentUser,
  userEmail,
  genderRestriction,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<SafeRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const loginModal = useLoginModal();

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

  const handleLoginClick = useCallback(() => {
    loginModal.onOpen();
  }, [loginModal]);

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

  const getGenderRestrictionInfo = (restriction: string): GenderRestrictionInfo => {
    switch (restriction.toUpperCase()) {
      case 'MEN_ONLY':
        return {
          icon: FaMars,
          label: 'Male only',
          className: 'bg-blue-50 text-blue-700'
        };
      case 'LADIES_ONLY':
        return {
          icon: FaVenus,
          label: 'Female only',
          className: 'bg-pink-50 text-pink-700'
        };
      default: // BOTH
        return {
          icon: FaVenusMars,
          label: 'All genders welcome',
          className: 'bg-purple-50 text-purple-700'
        };
    }
  };

  return (
    <div className="col-span-5 flex flex-col gap-6">
      {/* Header Section - Remove host info */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <Heading title={title} subtitle={`${street}, Barangay ${barangay}, Surigao City`} />
          </div>
          <div className="flex items-center gap-3">
            {category && (
              <ListingCategory
                icon={category.icon}
                label={category.title}
                description={category.desc}
              />
            )}
            {genderRestriction && (
              <div className="flex items-center gap-2">
                {(() => {
                  const { icon: Icon, label, className } = getGenderRestrictionInfo(genderRestriction);
                  return (
                    <div className={`
                      flex items-center gap-1.5 
                      px-3 py-1.5 
                      rounded-full 
                      text-sm font-medium
                      ${className}
                    `}>
                      <Icon size={16} />
                      <span>{label}</span>
                    </div>
                  );
                })()}
              </div>
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
              const Icon = FaIcons[item.amenity.icon as keyof typeof FaIcons] || FaIcons.FaQuestion;
              
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

      {/* Updated Host Information Section with Modern UI */}
      <section className="bg-white rounded-xl border border-neutral-100 overflow-hidden shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Host Information</h2>
          
          {/* Host Profile Card */}
          <div className="flex flex-col gap-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar 
                  src={user?.image} 
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    Property Host
                  </span>
                  <span className="text-sm text-gray-500">
                    Member since {new Date(user?.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              {currentUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactNumber && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <MdPhone className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{contactNumber}</p>
                      </div>
                    </div>
                  )}
                  {userEmail && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <MdEmail className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{userEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactNumber && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <MdPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <div className="h-4 w-32 bg-gray-200 blur-sm rounded mt-1" />
                        </div>
                      </div>
                    )}
                    {userEmail && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <MdEmail className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <div className="h-4 w-40 bg-gray-200 blur-sm rounded mt-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLoginClick}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg"  
                      className="h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Login to view host credentials
                  </button>
                </div>
              )}
            </div>

            {/* Additional Host Info */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-indigo-600" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <h4 className="text-sm font-medium text-gray-900">About the Host</h4>
              </div>
              <p className="text-sm text-gray-600">
                Joined the platform in {new Date(user?.createdAt).getFullYear()} • Verified host
              </p>
            </div>
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

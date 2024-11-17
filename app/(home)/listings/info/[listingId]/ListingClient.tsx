'use client';

import Container from '@/app/components/Container';
import useLoginModal from '@/app/hooks/useLoginModal';
import { SafeListing, SafeUser, SafeRoom } from '@/app/types';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import axios from 'axios';
import toast from 'react-hot-toast';
import { categories } from '@/app/components/navbar/Categories';
import ListingHead from '@/app/components/listings/ListingHead';
import ListingInfo from '@/app/components/listings/ListingInfo';
import SelectDateTime from '@/app/components/inputs/SelectDateTime';

interface ListingClientProps {
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  currentUser,
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<SafeRoom[]>([]);
  const [selectedRoomOption, setSelectedRoomOption] = useState<{ value: string, label: string } | null>(null);

  // Fetch rooms belonging to the listing
  useEffect(() => {
    if (listing?.id) {
      axios
        .get(`/api/rooms?listingId=${listing.id}`)
        .then((response) => {
          setRooms(response.data);
        })
        .catch((error) => {
          console.error('Error fetching rooms:', error);
        });
    }
  }, [listing?.id]);

  const handleRoomSelect = (roomId: string, roomTitle: string) => {
    setSelectedRoomOption({ value: roomId, label: roomTitle });
  };

  const handleRoomChange = (option: { value: string, label: string } | null) => {
    setSelectedRoomOption(option);
  };

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  return (
    <div className="max-w-screen mx-auto">
      <div className="flex flex-col gap-6">
        <ListingHead
          imageSrc={listing.imageSrc.images}
          id={listing.id}
          currentUser={currentUser}
        />
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-7 md:gap-16 gap-2 mt-6"
      >
        <div className="md:col-span-5">
          <ListingInfo
            title={listing.title}
            user={listing.user}
            category={category}
            description={listing.description}
            roomCount={listing.roomCount}
            locationValue={listing.locationValue.latlng}
            barangay={listing.barangay}
            street={listing.street}
            rooms={rooms}
            onRoomSelect={handleRoomSelect}
            rules={listing.rules || {
              petsAllowed: false,
              childrenAllowed: false,
              smokingAllowed: false,
              additionalNotes: null
            }}
            hasAgeRequirement={listing.hasAgeRequirement}
            minimumAge={listing.minimumAge}
            propertyAmenities={listing.propertyAmenities}
            overnightGuestsAllowed={listing.overnightGuestsAllowed}
          />
        </div>

        <div className="md:col-span-2">
          <SelectDateTime
            rooms={rooms}
            currentUser={currentUser}
            listingId={listing.id}
            selectedRoom={selectedRoomOption}
            onRoomChange={handleRoomChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ListingClient;

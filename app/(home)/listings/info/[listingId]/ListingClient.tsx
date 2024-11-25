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
import { ListingCategories } from '@prisma/client';

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
  const [categoryData, setCategoryData] = useState<ListingCategories | null>(null);
  const [selectedRoomOption, setSelectedRoomOption] = useState<{ value: string, label: string } | null>(null);

  // Fetch rooms and category data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms
        const roomsResponse = await axios.get(`/api/rooms?listingId=${listing.id}`);
        setRooms(roomsResponse.data);

        // Fetch category data using the category title
        if (listing.category) {
          const categoryResponse = await axios.get(`/api/categories/${encodeURIComponent(listing.category)}`);
          console.log("Category response:", categoryResponse.data);
          setCategoryData(categoryResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (listing?.id) {
      fetchData();
    }
  }, [listing?.id, listing.category]);

  const handleRoomSelect = (roomId: string, roomTitle: string) => {
    setSelectedRoomOption({ value: roomId, label: roomTitle });
  };

  const handleRoomChange = (option: { value: string, label: string } | null) => {
    setSelectedRoomOption(option);
  };

  console.log(currentUser)

  return (
      <div className="max-w-screen-xl mx-auto pt-14 pb-14">
        <div className="flex flex-col gap-6">
          <ListingHead
            imageSrc={listing.imageSrc.images}
            id={listing.id}
            currentUser={currentUser}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 md:gap-3 gap-2 mt-6">
          <div className="md:col-span-5">
            <ListingInfo
              currentUser={currentUser}
              title={listing.title}
              user={listing.user}
              category={categoryData}
              description={listing.description}
              roomCount={listing.roomCount}
              locationValue={listing.locationValue.latlng}
              barangay={listing.barangay}
              street={listing.street}
              rooms={rooms}
              genderRestriction={listing.genderRestriction}
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
              userEmail={listing.user.email}
              contactNumber={listing.user.phoneNumber}
            />
          </div>

          <div className="md:col-span-2">
            <div className="sticky top-20">
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
      </div>
  );
};

export default ListingClient;

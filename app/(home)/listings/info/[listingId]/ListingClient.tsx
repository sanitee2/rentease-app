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
import Footer from '@/app/components/Footer';
import { FaPesoSign } from 'react-icons/fa6';

interface ListingClientProps {
  listing: SafeListing & {
    user: SafeUser;
    leaseContracts?: {
      id: string;
      status: string;
    }[];
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

  // Calculate current tenants based on room occupancy and listing tenants
  const currentTenants = useMemo(() => {
    if (listing.pricingType === 'LISTING_BASED') {
      // For listing-based, get tenants directly from the listing
      return listing.tenants || [];
    } else {
      // For room-based, aggregate tenants from all rooms
      return rooms.reduce((acc, room) => {
        return [...acc, ...(room.tenants?.map(tenant => tenant.id) || [])];
      }, [] as string[]);
    }
  }, [listing, rooms]);

  return (
    <>
      <div className="max-w-screen-xl mx-auto py-4 md:py-12">
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
              pricingType={listing.pricingType}
              price={listing.price}
            />
          </div>

          <div className="md:col-span-2">
            <div className="sticky top-24 mb-10">
              <SelectDateTime
                rooms={rooms}
                currentUser={currentUser}
                listingId={listing.id}
                selectedRoom={selectedRoomOption}
                onRoomChange={handleRoomChange}
                pricingType={listing.pricingType}
                listing={listing}
                hasMaxTenantCount={listing.hasMaxTenantCount}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingClient;

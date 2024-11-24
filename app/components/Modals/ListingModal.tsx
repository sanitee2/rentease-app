'use client';

import { SafeListing, SafeUser } from "@/app/types";
import Modal from "@/app/components/Modals/Modal";
import { useMemo } from "react";
import { categories } from "../navbar/Categories";
import ListingInfo from "../listings/ListingInfo";
import Image from "next/image";

interface ListingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const ListingModal: React.FC<ListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser
}) => {
  const category = useMemo(() => {
    const found = categories.find((item) => item.label === listing.category);
    return found ? {
      id: found.label,
      title: found.label,
      icon: found.icon.toString(),
      desc: found.description,
      needsMaxTenant: false,
      pricingType: 'default',
      roomTypes: []
    } : null;
  }, [listing.category]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Property Details"
      className="max-w-4xl" // Make modal wider for better content display
      body={
        <div className="flex flex-col gap-4">
          <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
            <Image
              fill
              alt="Property"
              src={listing.imageSrc.images[0]}
              className="object-cover w-full"
            />
          </div>
          <ListingInfo
            title={listing.title}
            user={currentUser!}
            category={category}
            currentUser={currentUser}
            userEmail={currentUser?.email}
            description={listing.description}
            roomCount={listing.roomCount}
            locationValue={listing.locationValue.latlng}
            barangay={listing.barangay}
            street={listing.street}
            rooms={[]}
            onRoomSelect={() => {}}
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
      }
    />
  );
};

export default ListingModal;
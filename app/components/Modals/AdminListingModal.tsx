'use client';

import Modal from "./Modal";
import { SafeListing, SafeUser } from "@/app/types";
import { useCallback, useEffect, useState } from "react";
import ListingHead from "../listings/ListingHead";
import ListingInfo from "../listings/ListingInfo";
import axios from "axios";
import { ListingCategories } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AdminListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: SafeListing;
  user: SafeUser | null;
  currentUser: SafeUser | null;
  onAction?: () => void;
}

const AdminListingModal: React.FC<AdminListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  user,
  currentUser,
  onAction,
}) => {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [categoryData, setCategoryData] = useState<ListingCategories | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch rooms and category data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms
        const roomsResponse = await axios.get(`/api/rooms?listingId=${listing.id}`);
        setRooms(roomsResponse.data);

        // Fetch category data
        if (listing.category) {
          const categoryResponse = await axios.get(`/api/categories/${encodeURIComponent(listing.category)}`);
          setCategoryData(categoryResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (listing?.id && isOpen) {
      fetchData();
    }
  }, [listing?.id, listing.category, isOpen]);

  const handleApprove = useCallback(async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/listings/${listing.id}/verify`, {
        status: 'ACTIVE'
      });
      
      toast.success('Listing approved successfully');
      onAction?.();
      router.refresh();
      onClose();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [listing.id, router, onClose, onAction]);

  const handleDecline = useCallback(async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/listings/${listing.id}/verify`, {
        status: 'DECLINED'
      });
      
      toast.success('Listing declined');
      onAction?.();
      router.refresh();
      onClose();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [listing.id, router, onClose, onAction]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-6">
        <ListingHead
          imageSrc={listing.imageSrc.images}
          id={listing.id}
        />
      </div>
      <div className="mt-6">
        <ListingInfo
          title={listing.title}
          user={user}
          category={categoryData}
          pricingType={listing.pricingType}
          description={listing.description}
          roomCount={listing.roomCount}
          locationValue={listing.locationValue.latlng}
          barangay={listing.barangay}
          street={listing.street}
          rooms={rooms}
          genderRestriction={listing.genderRestriction}
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
          userEmail={user?.email}
          contactNumber={user?.phoneNumber}
          currentUser={currentUser}
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="View Listing"
      body={bodyContent}
      disabled={isLoading}
      actionLabel={listing.status === 'PENDING' && currentUser?.role === 'ADMIN' ? "Approve" : undefined}
      onSubmit={listing.status === 'PENDING' && currentUser?.role === 'ADMIN' ? handleApprove : undefined}
      secondaryActionLabel={listing.status === 'PENDING' && currentUser?.role === 'ADMIN' ? "Decline" : undefined}
      secondaryAction={listing.status === 'PENDING' && currentUser?.role === 'ADMIN' ? handleDecline : undefined}
      size="md"
    />
  );
};

export default AdminListingModal; 
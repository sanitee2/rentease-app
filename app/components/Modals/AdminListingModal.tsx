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
import { DynamicFullScreenGallery } from '../dynamic';
import { MdOutlinePictureAsPdf, MdPictureAsPdf } from "react-icons/md";
import { FaImages } from "react-icons/fa";

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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  console.log(listing.permitImages);
  console.log(Array.isArray(listing.permitImages))

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

  const handleViewBusinessPermit = () => {
    // Check if listing.permitImages.images is an array and contains at least one URL
    if (
      listing.permitImages &&
      Array.isArray(listing.permitImages.images) &&
      listing.permitImages.images.length > 0
    ) {
      setIsGalleryOpen(true);
    } else {
      toast.error("No business permit images available");
    }
  };

  const handleCloseGallery = () => {
    setIsGalleryOpen(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">

    {listing.permitImages && Array.isArray(listing.permitImages.images) && listing.permitImages.images.length > 0 && (

    <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50 border border-gray-300 rounded-lg">
      {/* Left Column: Title and Description */}
      <div className="md:w-2/3 text-center md:text-left">
        <h2 className="text-2xl font-bold text-indigo-600">Business Permit</h2>
        <p className="text-sm text-gray-600 mt-2">
          To ensure the legitimacy of this listing, view the uploaded business permit. Click the button below to access the document.
        </p>
      </div>

      {/* Right Column: Button */}
      <div className="md:w-1/3 flex justify-center">
        <button
          className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200"
          onClick={handleViewBusinessPermit}
        >
          <FaImages size={20} />
          <span>View Business Permit</span>
        </button>
      </div>
    </div>

    )}
      
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
    <>
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
      {isGalleryOpen &&
      listing.permitImages &&
      Array.isArray(listing.permitImages.images) && (
        <DynamicFullScreenGallery
          images={listing.permitImages.images} // Pass array of image URLs
          onClose={handleCloseGallery}
          initialIndex={0}
        />
      )}
    </>
  );
};

export default AdminListingModal;
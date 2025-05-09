'use client';

import { SafeListing, SafeUser } from "@/app/types";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface FavoritesClientProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
}

interface LeaseContract {
  id: string;
  status: "PENDING" | "ACTIVE" | "DECLINED" | "ARCHIVED";
  roomId: string | null;
  listingId: string | null;
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  currentUser
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onRemove = useCallback(async (listingId: string) => {
    setDeletingId(listingId);

    try {
      await axios.delete(`/api/favorites/${listingId}`);
      toast.success('Removed from favorites');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setDeletingId('');
    }
  }, [router]);

  return (
    <div className="pb-20 pt-10">
      <Container>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">
              Favorites
            </h1>
            <p className="text-neutral-500 mt-2">
              List of properties you have favorited
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                data={{
                  ...listing,
                  price: listing.price ?? undefined,
                  maxGuests: listing.maxGuests ?? undefined,
                  minimumAge: listing.minimumAge ?? undefined,
                  maxTenantCount: listing.maxTenantCount ?? undefined,
                  propertyAmenities: listing.propertyAmenities.map(pa => ({
                    id: pa.amenity.id,
                    amenity: pa.amenity,
                    note: pa.note
                  })),
                  leaseContracts: (listing.leaseContracts as LeaseContract[])?.map(lc => ({
                    id: lc.id,
                    status: lc.status,
                    roomId: lc.roomId,
                    listingId: lc.listingId
                  })) || [],
                  rules: listing.rules ? {
                    ...listing.rules,
                    additionalNotes: listing.rules.additionalNotes || undefined
                  } : undefined
                }}
                currentUser={currentUser}
                onAction={onRemove}
                disabled={deletingId === listing.id}
                actionId={listing.id}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FavoritesClient; 
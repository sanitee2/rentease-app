import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import Container from "@/app/components/Container";

import prisma from "@/app/libs/prismadb";
import FavoritesClient from "./FavoritesClient";
import { SafeListing } from "@/app/types";
import Footer from "@/app/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Favorites - RentEase',
  description: 'List of properties you have favorited',
};

// Add type for lease contract
interface LeaseContract {
  id: string;
  status: "PENDING" | "ACTIVE" | "DECLINED" | "ARCHIVED";
  roomId: string | null;
  listingId: string | null;
}

const FavoritesPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login to view your favorites"
        />
      </ClientOnly>
    );
  }

  // Fetch favorited listings with their details
  const favorites = await prisma.listing.findMany({
    where: {
      id: {
        in: [...(currentUser.favoriteIds || [])]
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageSrc: true,
      category: true,
      roomCount: true,
      locationValue: true,
      street: true,
      barangay: true,
      status: true,
      price: true,
      pricingType: true,
      maxGuests: true,
      hasAgeRequirement: true,
      minimumAge: true,
      genderRestriction: true,
      overnightGuestsAllowed: true,
      hasMaxTenantCount: true,
      maxTenantCount: true,
      createdAt: true,
      updatedAt: true,
      propertyAmenities: {
        select: {
          id: true,
          amenity: {
            select: {
              id: true,
              title: true,
              icon: true,
              desc: true
            }
          },
          note: true
        }
      },
      rooms: {
        select: {
          id: true,
          title: true,
          price: true,
          maxTenantCount: true,
          currentTenants: true
        }
      },
      rules: {
        select: {
          id: true,
          listingId: true,
          petsAllowed: true,
          childrenAllowed: true,
          smokingAllowed: true,
          additionalNotes: true
        }
      },
      leaseContracts: {
        select: {
          id: true,
          status: true,
          roomId: true,
          listingId: true
        }
      },
      userId: true,
      landlordProfileId: true,
      user: true
    }
  });

  // Transform the data to match SafeListing type
  const safeFavorites: SafeListing[] = favorites.map((favorite) => ({
    ...favorite,
    createdAt: favorite.createdAt.toISOString(),
    updatedAt: favorite.updatedAt.toISOString(),
    price: favorite.price || null,
    userId: favorite.userId,
    landlordProfileId: favorite.landlordProfileId,
    permitImages: favorite.imageSrc,
    rooms: favorite.rooms.map(room => ({
      id: room.id,
      title: room.title,
      price: room.price,
      maxTenantCount: room.maxTenantCount,
      currentTenants: room.currentTenants
    })),
    rules: favorite.rules,
    leaseContracts: (favorite.leaseContracts as LeaseContract[])?.map(lc => ({
      id: lc.id,
      status: lc.status,
      roomId: lc.roomId,
      listingId: lc.listingId
    })) || [],
    propertyAmenities: favorite.propertyAmenities,
    user: {
      ...favorite.user,
      createdAt: favorite.user.createdAt.toISOString(),
      updatedAt: favorite.user.updatedAt.toISOString(),
      emailVerified: favorite.user.emailVerified?.toISOString() || null,
    }
  }));

  if (safeFavorites.length === 0) {
    return (
      <ClientOnly>
        <div className="pt-10 pb-20">
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
              
              <div className="flex items-center justify-center min-h-[60vh]">
                <EmptyState
                  title="No favorites found"
                  subtitle="Looks like you haven't favorited any properties yet."
                />
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <FavoritesClient 
        listings={safeFavorites}
        currentUser={currentUser}
      />
      <Footer />
    </ClientOnly>
  );
};

export default FavoritesPage; 
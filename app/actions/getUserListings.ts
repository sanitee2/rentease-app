import prisma from "@/app/libs/prismadb";
import { SafeListing } from "../types";

export default async function getUserListings(userId: string): Promise<SafeListing[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        userId: userId
      },
      include: {
        propertyAmenities: {
          include: {
            amenity: true
          }
        },
        rules: true,
        rooms: true,
        leaseContracts: true
      }
    });

    const safeListing = listings.map(listing => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      propertyAmenities: listing.propertyAmenities.map(pa => ({
        amenity: {
          id: pa.amenity.id,
          title: pa.amenity.title,
          icon: pa.amenity.icon,
          desc: pa.amenity.desc
        },
        note: pa.note
      })),
      rules: listing.rules ? {
        id: listing.rules.id,
        listingId: listing.rules.listingId,
        petsAllowed: listing.rules.petsAllowed,
        childrenAllowed: listing.rules.childrenAllowed,
        smokingAllowed: listing.rules.smokingAllowed,
        additionalNotes: listing.rules.additionalNotes
      } : null,
      rooms: listing.rooms
    }));

    return safeListing;
  } catch (error: any) {
    throw new Error(error);
  }
}

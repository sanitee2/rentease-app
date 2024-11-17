import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId: currentUser.id
      },
      include: {
        propertyAmenities: {
          include: {
            amenity: true
          }
        },
        rules: true
      }
    });

    const safeListings = listings.map(listing => ({
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
      } : null
    }));

    return NextResponse.json(safeListings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
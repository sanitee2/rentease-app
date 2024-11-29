import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { listingId } = params;

    if (!listingId) {
      return new NextResponse('Listing ID is required', { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId
      },
      include: {
        rooms: {
          include: {
            amenities: {
              include: {
                amenity: true
              }
            }
          }
        },
        propertyAmenities: {
          include: {
            amenity: true
          }
        },
        rules: true
      }
    });

    if (!listing) {
      return new NextResponse('Listing not found', { status: 404 });
    }

    const transformedListing = {
      ...listing,
      images: listing?.imageSrc?.images || [],
      rooms: listing.rooms.map(room => ({
        ...room,
        images: room.imageSrc?.images || [],
        price: room.price || 0,
        amenities: room.amenities.map(amenityRelation => ({
          id: amenityRelation.amenity.id,
          title: amenityRelation.amenity.title,
          icon: amenityRelation.amenity.icon,
          desc: amenityRelation.amenity.desc,
          selected: true,
          note: amenityRelation.note || ''
        }))
      })),
      propertyAmenities: listing.propertyAmenities.reduce((acc, relation) => ({
        ...acc,
        [relation.amenity.id]: {
          selected: true,
          note: relation.note || '',
          id: relation.amenity.id,
          title: relation.amenity.title,
          icon: relation.amenity.icon,
          desc: relation.amenity.desc
        }
      }), {})
    };

    return NextResponse.json(transformedListing);
  } catch (error) {
    console.error('[LISTING_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const body = await request.json();
    const updatedListing = await prisma.listing.update({
      where: { id: params.listingId },
      data: body,
      include: {
        propertyAmenities: {
          include: {
            amenity: true
          }
        },
        rules: true
      }
    });

    // Emit socket event for update
    try {
      const safeListing = {
        ...updatedListing,
        createdAt: updatedListing.createdAt.toISOString(),
        updatedAt: updatedListing.updatedAt.toISOString(),
        propertyAmenities: updatedListing.propertyAmenities.map(pa => ({
          amenity: {
            id: pa.amenity.id,
            title: pa.amenity.title,
            icon: pa.amenity.icon,
            desc: pa.amenity.desc
          },
          note: pa.note
        })),
        rules: updatedListing.rules ? {
          id: updatedListing.rules.id,
          listingId: updatedListing.rules.listingId,
          petsAllowed: updatedListing.rules.petsAllowed,
          childrenAllowed: updatedListing.rules.childrenAllowed,
          smokingAllowed: updatedListing.rules.smokingAllowed,
          additionalNotes: updatedListing.rules.additionalNotes
        } : null
      };
      
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('[LISTING_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
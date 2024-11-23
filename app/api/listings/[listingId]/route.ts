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
    const { listingId } = params;
    const body = await request.json();

    // First, delete all room amenities
    const existingRooms = await prisma.room.findMany({
      where: { listingId },
      include: { amenities: true }
    });

    for (const room of existingRooms) {
      await prisma.roomsOnAmenities.deleteMany({
        where: { roomId: room.id }
      });
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId
      },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        locationValue: body.locationValue,
        imageSrc: body.imageSrc,
        genderRestriction: body.genderRestriction,
        hasAgeRequirement: body.hasAgeRequirement,
        minimumAge: body.minimumAge,
        overnightGuestsAllowed: body.overnightGuestsAllowed,
        maxGuests: body.maxGuests,
        rooms: {
          deleteMany: {},
          create: body.rooms.map((room: any) => ({
            title: room.title,
            description: room.description,
            imageSrc: { images: room.images },
            price: parseFloat(room.price) || 0,
            roomCategory: room.roomCategory,
            maxTenantCount: room.maxTenantCount || 1,
            currentTenants: room.currentTenants || 0,
            amenities: {
              create: Object.entries(room.amenities || {})
                .filter(([_, value]: [string, any]) => value.selected && value.id)
                .map(([_, value]: [string, any]) => ({
                  amenityId: value.id,
                  note: value.note || ''
                }))
            }
          }))
        },
        propertyAmenities: {
          deleteMany: {},
          create: Object.entries(body.propertyAmenities || {})
            .filter(([_, value]: [string, any]) => value.selected && value.id)
            .map(([_, value]: [string, any]) => ({
              amenityId: value.id,
              note: value.note || ''
            }))
        },
        rules: {
          upsert: {
            create: {
              petsAllowed: body.petsAllowed,
              childrenAllowed: body.childrenAllowed,
              smokingAllowed: body.smokingAllowed,
              additionalNotes: body.additionalNotes
            },
            update: {
              petsAllowed: body.petsAllowed,
              childrenAllowed: body.childrenAllowed,
              smokingAllowed: body.smokingAllowed,
              additionalNotes: body.additionalNotes
            }
          }
        }
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

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('[LISTING_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getUserListings from '@/app/actions/getUserListings';
import { getIO } from '@/app/lib/socket';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      location,
      street,
      barangay,
      rooms,
      price,
      maxGuests,
      petsAllowed,
      childrenAllowed,
      smokingAllowed,
      additionalNotes,
      overnightGuestsAllowed,
      hasAgeRequirement,
      minimumAge,
      genderRestriction,
      propertyAmenities,
      hasMaxTenantCount,
      maxTenantCount,
    } = body;

    // Get the listing category to determine pricing type
    const listingCategory = await prisma.listingCategories.findFirst({
      where: { title: category }
    });

    if (!listingCategory) {
      return NextResponse.json(
        { error: "Invalid listing category" },
        { status: 400 }
      );
    }

    const listing = await prisma.$transaction(async (prismaClient) => {
      // Create the listing
      const newListing = await prismaClient.listing.create({
        data: {
          title,
          description,
          imageSrc,
          category,
          roomCount,
          street,
          barangay,
          locationValue: {
            latlng: [location[0], location[1]],
          },
          userId: currentUser.id,
          maxGuests: overnightGuestsAllowed ? parseInt(maxGuests) : undefined,
          hasAgeRequirement,
          minimumAge: hasAgeRequirement ? parseInt(minimumAge) : undefined,
          genderRestriction,
          overnightGuestsAllowed,
          price: listingCategory.pricingType === 'LISTING_BASED' ? parseInt(price) : null,
          pricingType: listingCategory.pricingType,
          rules: {
            create: {
              petsAllowed,
              childrenAllowed,
              smokingAllowed,
              additionalNotes: additionalNotes?.trim() || null,
            }
          },
          propertyAmenities: {
            create: Object.entries(propertyAmenities)
              .filter(([_, value]: [string, any]) => value.selected)
              .map(([amenityId, value]: [string, any]) => ({
                amenityId,
                note: value.note || null
              }))
          },
          hasMaxTenantCount: listingCategory.pricingType === 'LISTING_BASED' ? hasMaxTenantCount : false,
          maxTenantCount: hasMaxTenantCount ? parseInt(maxTenantCount) : null,
        },
      });

      // Create rooms if they exist
      if (rooms && rooms.length > 0) {
        for (const room of rooms) {
          // Create the room first
          const newRoom = await prismaClient.room.create({
            data: {
              title: room.title,
              description: room.description,
              imageSrc: { images: room.images },
              roomCategory: room.roomCategory,
              price: listingCategory.pricingType === 'ROOM_BASED' ? 
                parseFloat(room.price.toString()) : null,
              listingId: newListing.id,
              maxTenantCount: room.maxTenantCount ? 
                parseInt(room.maxTenantCount.toString()) : 1,
              currentTenants: undefined
            }
          });

          // Then create room amenities if they exist
          if (room.amenities) {
            type AmenityValue = {
              selected: boolean;
              note?: string;
            };

            const amenityEntries: [string, AmenityValue][] = Object.entries(room.amenities);
            const selectedAmenities = amenityEntries.filter(([_, value]) => value.selected);

            for (const [amenityId, value] of selectedAmenities) {
              await prismaClient.roomsOnAmenities.create({
                data: {
                  roomId: newRoom.id,
                  amenityId,
                  note: value.note || null
                }
              });
            }
          }
        }
      }

     // After successful creation, emit socket event
      try {
        const io = getIO();
        if (io) {
          io.emit('listing-created', {
            ...newListing,
            createdAt: newListing.createdAt.toISOString(),
            updatedAt: newListing.updatedAt.toISOString(),
          });
        }
      } catch (socketError) {
         // Log the error but don't fail the request
        console.error('Socket emission error:', socketError);
      }
      return newListing;
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: "Something went wrong while creating the listing and rooms." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updatedListing = await prisma.listing.update({
      where: { id: body.id },
      data: body,
    });

    // Emit socket event for update
    try {
      const io = getIO();
      io.emit('listing-updated', {
        ...updatedListing,
        createdAt: updatedListing.createdAt.toISOString(),
        updatedAt: updatedListing.updatedAt.toISOString(),
      });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
    }

    const deletedListing = await prisma.listing.delete({
      where: { id: listingId }
    });

    // Emit socket event for deletion
    try {
      const io = getIO();
      io.emit('listing-deleted', listingId);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return NextResponse.json(deletedListing);
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const pricingType = searchParams.get('pricingType');
    const genderRestriction = searchParams.get('genderRestriction');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    let query: any = {
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
        rooms: {
          select: {
            id: true,
            title: true,
            description: true,
            imageSrc: true,
            price: {
              select: {
                price: true,
                _conditional: {
                  pricingType: 'ROOM_BASED'
                }
              }
            },
            roomCategory: true,
            maxTenantCount: true,
            currentTenants: true,
            amenities: {
              select: {
                amenity: {
                  select: {
                    id: true,
                    title: true,
                    icon: true,
                    desc: true
                  }
                }
              }
            }
          }
        },
        rules: true,
        createdAt: true,
        updatedAt: true
      },
      where: {
        AND: [
          { status: 'ACTIVE' },
          {
            OR: [
              // For listing-based pricing
              {
                AND: [
                  { pricingType: 'LISTING_BASED' },
                  ...(minPrice ? [{ price: { gte: parseInt(minPrice) } }] : []),
                  ...(maxPrice ? [{ price: { lte: parseInt(maxPrice) } }] : [])
                ]
              },
              // For room-based pricing
              {
                AND: [
                  { pricingType: 'ROOM_BASED' },
                  {
                    rooms: {
                      some: {
                        AND: [
                          ...(minPrice ? [{ price: { gte: parseInt(minPrice) } }] : []),
                          ...(maxPrice ? [{ price: { lte: parseInt(maxPrice) } }] : [])
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    // Add other filters
    if (category) {
      query.where.AND.push({ category });
    }

    if (pricingType) {
      query.where.AND.push({ pricingType });
    }

    if (genderRestriction) {
      query.where.AND.push({ genderRestriction });
    }

    // Get listings
    let listings = await prisma.listing.findMany(query);

    // Handle location filtering if needed
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      listings = listings.filter(listing => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          listing.locationValue.latlng[0],
          listing.locationValue.latlng[1]
        );
        return distance <= radiusKm;
      });
    }

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getUserListings from '@/app/actions/getUserListings';
// import { getIO } from '@/app/lib/socket';  // Commented out socket import
import { 
  AdminNotification, 
  NotificationStatus, 
  NotificationType,
  AdminNewListingData 
} from '@/app/types/notifications';

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

      /* Commenting out socket notification logic
      try {
        const socketIO = getIO();
        if (socketIO) {
          const socketData: AdminNewListingData = {
            listingId: newListing.id,
            landlordId: currentUser.id,
            message: `New listing "${title}" submitted by ${currentUser.firstName} ${currentUser.lastName}`
          };

          const notificationData: Omit<AdminNotification, 'id'> = {
            type: NotificationType.NEW_LISTING,
            title: 'New Listing Submitted',
            message: socketData.message,
            status: NotificationStatus.INFO,
            isRead: false,
            createdAt: new Date().toISOString(),
            listingId: socketData.listingId,
            landlordId: socketData.landlordId,
          };

          const savedNotification = await prismaClient.notification.create({
            data: {
              ...notificationData,
              userId: currentUser.id,
            }
          });

          socketIO.to('role:ADMIN').emit('admin:new_listing', socketData);
        }
      } catch (error: any) {
        console.error('[Listings] Socket notification error:', error);
      }
      */

      return newListing;
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('[Listings] Error creating listing:', error);
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
    // try {
    //   const socketIO = getIO();
    //   if (socketIO) {
    //     socketIO.emit('listing-updated', {
    //       ...updatedListing,
    //       createdAt: updatedListing.createdAt.toISOString(),
    //       updatedAt: updatedListing.updatedAt.toISOString(),
    //     });
    //   }
    // } catch (socketError) {
    //   console.error('[Listings] Socket emission error:', socketError);
    // } 

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('[Listings] Error updating listing:', error);
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
    // try {
    //   const socketIO = getIO();
    //   if (socketIO) {
    //     socketIO.emit('listing-deleted', listingId);
    //   }
    // } catch (socketError) {
    //   console.error('[Listings] Socket emission error:', socketError);
    // }

    return NextResponse.json(deletedListing);
  } catch (error) {
    console.error('[Listings] Error deleting listing:', error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build where clause
    let where: any = {
      status: 'ACTIVE'
    };

    // Handle category filter
    if (searchParams.has('category')) {
      where.category = searchParams.get('category');
    }

    // Handle price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    // Handle gender restriction
    if (searchParams.has('genderRestriction')) {
      where.genderRestriction = searchParams.get('genderRestriction');
    }

    // Handle house rules
    const rulesFields = ['petsAllowed', 'childrenAllowed', 'smokingAllowed'];
    const rulesWhere: any = {};
    
    rulesFields.forEach(field => {
      if (searchParams.has(field)) {
        rulesWhere[field] = searchParams.get(field) === 'true';
      }
    });

    if (Object.keys(rulesWhere).length > 0) {
      where.rules = {
        some: rulesWhere
      };
    }

    // Handle location
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    
    if (lat && lng) {
      where.locationValue = {
        latlng: {
          equals: [parseFloat(lat), parseFloat(lng)]
        }
      };
    }

    // Handle amenities
    const amenities = searchParams.get('amenities');
    if (amenities) {
      const amenityIds = amenities.split(',');
      where.propertyAmenities = {
        some: {
          amenityId: {
            in: amenityIds
          }
        }
      };
    }

    // Execute query
    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: true,
        propertyAmenities: {
          include: {
            amenity: true
          }
        },
        rules: true
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('[LISTINGS_GET]', error);
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

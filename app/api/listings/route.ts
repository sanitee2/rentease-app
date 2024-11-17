import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getUserListings from '@/app/actions/getUserListings';

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
                parseInt(room.price.toString()) : null,
              listingId: newListing.id,
              maxTenantCount: room.maxTenantCount ? parseInt(room.maxTenantCount.toString()) : 1
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

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const listings = await getUserListings(currentUser.id);
    return NextResponse.json(listings);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

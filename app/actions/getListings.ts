import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export default async function getListings(params: { [key: string]: string | undefined }) {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      pricingType,
      genderRestriction,
      lat,
      lng,
      radius
    } = params;

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
        createdAt: true,
        updatedAt: true,
        userId: true,
        maxGuests: true,
        hasAgeRequirement: true,
        minimumAge: true,
        genderRestriction: true,
        overnightGuestsAllowed: true,
        price: true,
        pricingType: true,
        hasMaxTenantCount: true,
        maxTenantCount: true,
        user: true,
        rooms: {
          select: {
            id: true,
            title: true,
            description: true,
            imageSrc: true,
            price: true,
            roomCategory: true,
            maxTenantCount: true,
            currentTenants: true
          }
        },
        rules: true
      },
      where: {
        status: 'ACTIVE'
      }
    };

    if (category) {
      query.where.category = category;
    }

    if (minPrice || maxPrice) {
      query.where.OR = [
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
      ];
    }

    if (pricingType) {
      query.where.pricingType = pricingType;
    }

    if (genderRestriction) {
      query.where.genderRestriction = genderRestriction;
    }

    const listings = await prisma.listing.findMany(query);

    if (lat && lng && radius) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      return listings.filter(listing => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          listing.locationValue.latlng[0],
          listing.locationValue.latlng[1]
        );
        return distance <= radiusKm;
      });
    }

    return listings;
  } catch (error) {
    console.error('getListings Error:', error);
    return [];
  }
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

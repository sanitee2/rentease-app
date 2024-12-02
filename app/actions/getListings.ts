import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { Prisma, PricingType } from "@prisma/client";

// Define the params interface
interface GetListingsParams {
  [key: string]: string | undefined;
  petsAllowed?: string;
  childrenAllowed?: string;
  smokingAllowed?: string;
}

export default async function getListings(params: GetListingsParams) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      pricingType,
      genderRestriction,
      lat,
      lng,
      radius,
      amenities,
      petsAllowed,
      childrenAllowed,
      smokingAllowed
    } = params;

    const query: Prisma.ListingFindManyArgs = {
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
        propertyAmenities: {
          include: {
            amenity: {
              select: {
                id: true,
                title: true,
                icon: true,
                desc: true
              }
            }
          }
        },
        rooms: {
          select: {
            id: true,
            title: true,
            description: true,
            imageSrc: true,
            price: true,
            roomCategory: true,
            maxTenantCount: true,
            tenants: {
              select: {
                id: true,
                // Add other tenant fields if needed
              }
            },
          }
        },
        rules: true,
        leaseContracts: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            status: true,
            roomId: true,
            listingId: true
          }
        }
      },
      where: {
        status: 'ACTIVE',
        ...(search ? {
          OR: [
            { 
              title: { 
                contains: search,
                mode: 'insensitive'
              } 
            },
            { 
              description: { 
                contains: search,
                mode: 'insensitive'
              } 
            },
            {
              street: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              barangay: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ]
        } : {})
      }
    };

    if (category) {
      query.where = {
        ...query.where,
        category
      };
    }

    if (minPrice || maxPrice) {
      query.where = {
        ...query.where,
        OR: [
          // For listing-based pricing
          {
            AND: [
              { pricingType: PricingType.LISTING_BASED },
              ...(minPrice ? [{ price: { gte: parseInt(minPrice) } }] : []),
              ...(maxPrice ? [{ price: { lte: parseInt(maxPrice) } }] : [])
            ]
          },
          // For room-based pricing
          {
            AND: [
              { pricingType: PricingType.ROOM_BASED },
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
      };
    }

    if (pricingType) {
      query.where = {
        ...query.where,
        pricingType: pricingType as PricingType
      };
    }

    if (genderRestriction) {
      query.where = {
        ...query.where,
        genderRestriction
      };
    }

    if (amenities) {
      const amenityIds = amenities.split(',');
      query.where = {
        ...query.where,
        propertyAmenities: {
          some: {
            amenityId: {
              in: amenityIds
            }
          }
        }
      };
    }

    if (petsAllowed === 'true' || childrenAllowed === 'true' || smokingAllowed === 'true') {
      query.where = {
        ...query.where,
        rules: {
          OR: [
            ...(petsAllowed === 'true' ? [{ petsAllowed: true }] : []),
            ...(childrenAllowed === 'true' ? [{ childrenAllowed: true }] : []),
            ...(smokingAllowed === 'true' ? [{ smokingAllowed: true }] : [])
          ]
        }
      };
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
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

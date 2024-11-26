import prisma from "@/app/libs/prismadb";
import { ListingStatus, Prisma } from "@prisma/client";
import { SafeListing, SafeUser } from "@/app/types";

interface ListingWithUser extends SafeListing {
  user: SafeUser;
}

export interface GetAdminListingsParams {
  status?: ListingStatus;
  page?: number;
  limit?: number;
  search?: string;
}

export default async function getAdminListings(params: GetAdminListingsParams = {}) {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      search
    } = params;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build the where clause with proper Prisma types
    let where: Prisma.ListingWhereInput = {};

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { street: { contains: search, mode: 'insensitive' } },
        { barangay: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: true,
          LandlordProfile: {
            include: {
              user: true
            }
          },
          propertyAmenities: {
            include: {
              amenity: true
            }
          },
          rules: true,
          rooms: {
            select: {
              id: true,
              title: true,
              price: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.listing.count({ where })
    ]);

    // Transform listings to SafeListing type with user data
    const safeListings = listings.map(listing => {
      const safeUser = {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified: listing.user.emailVerified?.toISOString() || null,
      };

      // If there's a landlord profile, use that user's info instead
      if (listing.LandlordProfile) {
        safeUser.firstName = listing.LandlordProfile.user.firstName;
        safeUser.lastName = listing.LandlordProfile.user.lastName;
        safeUser.email = listing.LandlordProfile.user.email;
        safeUser.phoneNumber = listing.LandlordProfile.phoneNumber || listing.LandlordProfile.user.phoneNumber;
      }

      return {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        user: safeUser,
        propertyAmenities: listing.propertyAmenities.map(pa => ({
          amenity: {
            id: pa.amenity.id,
            title: pa.amenity.title,
            icon: pa.amenity.icon,
            desc: pa.amenity.desc,
          },
          note: pa.note
        })),
        rules: listing.rules,
        rooms: listing.rooms.map(room => ({
          id: room.id,
          title: room.title,
          price: room.price || 0
        }))
      };
    });

    return {
      listings: safeListings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    };

  } catch (error) {
    console.error('[GET_ADMIN_LISTINGS]', error);
    throw new Error('Failed to fetch admin listings');
  }
} 
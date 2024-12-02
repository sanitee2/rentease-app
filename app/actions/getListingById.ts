import prisma from "@/app/libs/prismadb";
interface IParams {
  listingId?: string
}

function capitalizeStatus(status: any) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function getListingById(
  params: IParams
) {
  try {
    const { listingId } = params;
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId
      },
      include: {
        user: true,
        rooms: true,
        propertyAmenities: {
          include: {
            amenity: true,
          }
        },
        rules: true
      }
    })

    if(!listing) {
      return null
    }
    return {
      ...listing,
      status: capitalizeStatus(listing.status),
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified: 
          listing.user.emailVerified?.toISOString() || null
      }
    }
  }catch(error: any) {
    throw new Error(error);
  }
}
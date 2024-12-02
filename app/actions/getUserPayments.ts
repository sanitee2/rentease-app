import prisma from "@/app/libs/prismadb";

export default async function getUserPayments(userId: string) {
  try {
    // Get all listings owned by the landlord
    const landlordListings = await prisma.listing.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true
      }
    });

    const listingIds = landlordListings.map(listing => listing.id);

    // Get all payments from lease contracts associated with these listings
    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          listingId: {
            in: listingIds
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        lease: {
          select: {
            listing: {
              select: {
                title: true,
                street: true,
                barangay: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return payments;
  } catch (error: any) {
    console.error('Error in getUserPayments:', error);
    return [];
  }
} 
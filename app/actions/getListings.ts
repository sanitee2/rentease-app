import prisma from "@/app/libs/prismadb";



export default async function getListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE', // Only fetch active listings
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(), // Convert updatedAt to a string
    }));

    return safeListings;
  } catch (error: any) {
    throw new Error(error);
  }
}

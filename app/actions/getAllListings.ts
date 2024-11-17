import prisma from "@/app/libs/prismadb";

export default async function getAllListings() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Safe conversion of dates for serialization
    const safeListings = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      createdAt: listing.createdAt.toISOString(),
    }));

    return safeListings;
  } catch (error: any) {
    throw new Error(error);
  }
}

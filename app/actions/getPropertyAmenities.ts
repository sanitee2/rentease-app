import prisma from "@/app/libs/prismadb";

export async function getPropertyAmenities() {
  try {
    const amenities = await prisma.propertyAmenity.findMany({
      orderBy: {
        title: 'asc'
      }
    });

    return amenities;
  } catch (error: any) {
    console.error('Error fetching property amenities:', error);
    return [];
  }
} 
import prisma from "@/app/libs/prismadb";

export default async function getListingCategories() {
  try {
    const categories = await prisma.listingCategories.findMany({
      select: {
        id: true,
        title: true,
        icon: true,
        desc: true,
        needsMaxTenant: true,
        pricingType: true,
        roomTypes: true,
      },
      orderBy: {
        title: 'asc'
      }
    });

    return categories;
  } catch (error: any) {
    throw new Error(error);
  }
} 
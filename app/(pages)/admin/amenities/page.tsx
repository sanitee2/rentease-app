import AmenitiesClient from './AmenitiesClient';
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from 'next/navigation';
import prisma from "@/app/libs/prismadb";

export const dynamic = 'force-dynamic';

// Add pagination constants
const ITEMS_PER_PAGE = 10;

const AmenitiesPage = async ({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) => {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return redirect('/');
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const type = searchParams.type || 'property';

  // Get total counts
  const [propertyCount, roomCount] = await Promise.all([
    prisma.propertyAmenity.count(),
    prisma.roomAmenity.count()
  ]);

  // Fetch paginated amenities
  const propertyAmenities = await prisma.propertyAmenity.findMany({
    orderBy: [
      { category: 'asc' },
      { arrangement: 'asc' },
      { title: 'asc' }
    ],
    skip: type === 'property' ? (page - 1) * ITEMS_PER_PAGE : 0,
    take: type === 'property' ? ITEMS_PER_PAGE : undefined,
  });

  const roomAmenities = await prisma.roomAmenity.findMany({
    orderBy: [
      { category: 'asc' },
      { arrangement: 'asc' },
      { title: 'asc' }
    ],
    skip: type === 'room' ? (page - 1) * ITEMS_PER_PAGE : 0,
    take: type === 'room' ? ITEMS_PER_PAGE : undefined,
  });

  const pagination = {
    total: type === 'property' ? propertyCount : roomCount,
    pages: Math.ceil((type === 'property' ? propertyCount : roomCount) / ITEMS_PER_PAGE),
    currentPage: page,
    perPage: ITEMS_PER_PAGE
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AmenitiesClient 
          propertyAmenities={propertyAmenities}
          roomAmenities={roomAmenities}
        />
      </div>
    </div>
  );
};

export default AmenitiesPage; 
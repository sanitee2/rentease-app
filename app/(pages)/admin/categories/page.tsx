import CategoriesClient from './CategoriesClient';
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from 'next/navigation';
import prisma from "@/app/libs/prismadb";

export const dynamic = 'force-dynamic';

const CategoriesPage = async ({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) => {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return redirect('/');
  }

  const listingCategories = await prisma.listingCategories.findMany({
    orderBy: {
      title: 'asc'
    }
  });

  const roomCategories = await prisma.roomCategories.findMany({
    orderBy: {
      title: 'asc'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoriesClient 
          listingCategories={listingCategories}
          roomCategories={roomCategories}
        />
      </div>
    </div>
  );
};

export default CategoriesPage; 
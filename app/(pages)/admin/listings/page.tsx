import ListingsClient from './ListingsClient';
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAdminListings from "@/app/actions/getAdminListings";
import { redirect } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';
import { ListingStatus } from '@prisma/client';

interface ListingWithUser extends SafeListing {
  user: SafeUser;
}

const ListingsPage = async ({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) => {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return redirect('/');
  }


  const result = await getAdminListings({
    status: searchParams.status as ListingStatus,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
    search: searchParams.search
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ListingsClient 
          initialListings={result.listings} 
          pagination={result.pagination}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default ListingsPage; 
export const dynamic = 'force-dynamic'

import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getListingCategories from "@/app/actions/getListingCategories";
import ListingsContent from "@/app/components/listings/ListingsContent";
import EmptyState from "@/app/components/EmptyState";

interface SearchParams {
  [key: string]: string | undefined;
}

const ListingsPage = async ({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) => {
  try {
    const [listings, currentUser, categories] = await Promise.all([
      getListings(searchParams).catch(() => []),
      getCurrentUser().catch(() => null),
      getListingCategories().catch(() => [])
    ]);

    console.log(listings)

    if (!listings) {
      return (
        <EmptyState
          title="No listings found"
          subtitle="Try adjusting your search filters"
        />
      );
    }

    return (
      <ListingsContent 
        listings={listings}
        currentUser={currentUser}
        categories={categories}
        searchParams={searchParams}
      />
    );
  } catch (error) {
    console.error('ListingsPage Error:', error);
    return (
      <EmptyState
        title="Something went wrong"
        subtitle="Please try again later"
      />
    );
  }
};

export default ListingsPage;

export const dynamic = 'force-dynamic'

import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getListingCategories from "@/app/actions/getListingCategories";
import ListingsContent from "@/app/components/listings/ListingsContent";
import ListingsFilter from "@/app/components/listings/ListingsFilter";
import EmptyState from "@/app/components/EmptyState";
import { cn } from "@/lib/utils";
import { getPropertyAmenities } from "@/app/actions/getPropertyAmenities";

interface SearchParams {
  [key: string]: string | undefined;
}

const ListingsPage = async ({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) => {
  try {
    const [listings, currentUser, categories, propertyAmenities] = await Promise.all([
      getListings(searchParams).catch(() => []),
      getCurrentUser().catch(() => null),
      getListingCategories().catch(() => []),
      getPropertyAmenities().catch(() => [])
    ]);

    if (!listings) {
      return (
        <EmptyState
          title="No listings found"
          subtitle="Try adjusting your search filters"
        />
      );
    }

    return (
      <div className="h-full bg-white">
        <div className="flex w-full">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-[360px] fixed left-0 top-[88px] h-[calc(100vh-88px)] bg-white border-r overflow-hidden">
            <ListingsFilter 
              categories={categories}
              propertyAmenities={propertyAmenities}
              isMobile={false}
            />
          </div>

          {/* Main Content Area */}
          <div className={cn(
            "flex-1 min-h-[calc(100vh-64px)]",
            // Conditional margin for desktop only
            "md:ml-[360px]"
          )}>
            <ListingsContent 
              listings={listings}
              currentUser={currentUser}
              categories={categories}
              propertyAmenities={propertyAmenities}
              searchParams={searchParams}
            />
          </div>
        </div>
      </div>
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

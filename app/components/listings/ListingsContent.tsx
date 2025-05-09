'use client';

import { useState } from 'react';
import { BiFilter } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ListingCard from '@/app/components/listings/ListingCard';
import MobileFilterDrawer from '@/app/components/listings/MobileFilterDrawer';
import EmptyState from '@/app/components/EmptyState';
import { SafeUser } from '@/app/types';

interface ListingsContentProps {
  listings: any[];
  currentUser?: SafeUser | null;
  categories: any[];
  propertyAmenities: any[];
  searchParams: any;
}

const ListingsContent: React.FC<ListingsContentProps> = ({
  listings,
  currentUser,
  categories,
  propertyAmenities,
  searchParams,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilters = Object.keys(searchParams).length > 0;

  const marginTop = currentUser ? 'top-[70px]' : 'top-[88px]';

  return (
    <div className="w-full">
      {/* Mobile Filter Button */}
      <div className={`md:hidden sticky ${marginTop} z-30 bg-white border-b p-4`}>
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <BiFilter size={20} />
            Filters
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary">
              {Object.keys(searchParams).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        propertyAmenities={propertyAmenities}
      />

      {/* Content Area */}
      <div className="p-4 md:p-8">
        {listings.length === 0 ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <EmptyState
              title={hasActiveFilters ? "No matches found" : "No listings available"}
              subtitle={hasActiveFilters 
                ? "Try changing or removing some filters" 
                : "There are no listings available at the moment"}
              showReset={hasActiveFilters}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {listings.map((listing: any) => (
              <ListingCard
                currentUser={currentUser}
                key={listing.id}
                data={listing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsContent; 
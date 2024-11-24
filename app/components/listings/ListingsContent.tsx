'use client';

import { useState } from 'react';
import { BiFilter } from 'react-icons/bi';
import Container from '@/app/components/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ListingCard from '@/app/components/listings/ListingCard';
import ListingsFilter from '@/app/components/listings/ListingsFilter';
import MobileFilterDrawer from '@/app/components/listings/MobileFilterDrawer';
import EmptyState from '@/app/components/EmptyState';
import { SafeUser } from '@/app/types';

interface ListingsContentProps {
  listings: any[];
  currentUser?: SafeUser | null;
  categories: any[];
  searchParams: { [key: string]: string | undefined };
}

const ListingsContent: React.FC<ListingsContentProps> = ({
  listings,
  currentUser,
  categories,
  searchParams
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilters = Object.keys(searchParams).length > 0;

  return (
    <Container>
      <div className="relative pt-4 lg:pt-8">
        {/* Mobile Filter Button - Only visible on small screens */}
        <div className="lg:hidden sticky top-[80px] z-10 bg-white border-b pb-4">
          <Button
            onClick={() => setIsFilterOpen(true)}
            variant="outline"
            className="w-full flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <BiFilter size={18} />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
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
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Filter sidebar - Hidden on mobile */}
          <aside className="hidden lg:block col-span-1">
            <div className="sticky top-[96px]">
              <ListingsFilter categories={categories} />
            </div>
          </aside>
          
          {/* Listings area */}
          <div className="col-span-1 lg:col-span-3">
            {listings.length === 0 ? (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState
                  title={hasActiveFilters 
                    ? "No matches found" 
                    : "No listings available"
                  }
                  subtitle={hasActiveFilters 
                    ? "Try changing or removing some filters" 
                    : "There are no listings available at the moment"
                  }
                  showReset={hasActiveFilters}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
      </div>
    </Container>
  );
};

export default ListingsContent; 
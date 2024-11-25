import Container from "@/app/components/Container";
import { BiFilter } from 'react-icons/bi';
import { Button } from '@/components/ui/button';

const LoadingState = () => {
  return (
    <Container>
      <div className="relative">
        {/* Mobile Filter Button Skeleton */}
        <div className="lg:hidden sticky top-[90px] z-10 bg-white border-b pb-4">
          <Button
            disabled
            variant="outline"
            className="w-full flex items-center justify-between text-sm animate-pulse"
          >
            <div className="flex items-center gap-2">
              <BiFilter size={18} className="text-gray-400" />
              <span>Filters</span>
            </div>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Filter Sidebar Skeleton */}
          <aside className="hidden lg:block col-span-1">
            <div className="sticky top-[96px] bg-white rounded-lg p-4 space-y-6">
              {/* Filter Section Headers */}
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </aside>

          {/* Listings Grid Skeleton */}
          <div className="col-span-1 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 9 }, (_, i) => (
                <div 
                  key={i}
                  className="col-span-1 group animate-pulse"
                  style={{
                    animationDelay: `${i * 100}ms`
                  }}
                >
                  {/* Image Skeleton */}
                  <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-gray-200" />
                  
                  {/* Content Container */}
                  <div className="mt-4 space-y-4">
                    {/* Title Skeleton */}
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    
                    {/* Location Skeleton */}
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    
                    {/* Price Skeleton */}
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    
                    {/* Category Pills */}
                    <div className="flex gap-2">
                      {[1, 2].map((pill) => (
                        <div 
                          key={pill}
                          className="h-6 w-16 bg-gray-200 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default LoadingState; 
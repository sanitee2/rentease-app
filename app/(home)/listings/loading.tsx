import Container from "@/app/components/Container";
import { BiFilter } from 'react-icons/bi';
import { Button } from '@/components/ui/button';

const LoadingState = () => {
  return (
    <div className="h-full bg-white">
      <div className="flex w-full">
        {/* Desktop Filter Sidebar Skeleton */}
        <div className="hidden md:block w-[360px] fixed left-0 top-[88px] h-[calc(100vh-88px)] bg-white border-r overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Filter Section Headers */}
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-[calc(100vh-64px)] md:ml-[360px]">
          {/* Mobile Filter Button Skeleton */}
          <div className="md:hidden sticky top-[90px] z-10 bg-white border-b pb-4 px-4">
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

          {/* Listings Grid Skeleton */}
          <div className="p-4 md:p-6">
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
    </div>
  );
};

export default LoadingState; 
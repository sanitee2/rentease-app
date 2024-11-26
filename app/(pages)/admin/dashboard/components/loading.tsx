import { Card } from "@/components/ui/card";
import { LuCheckCircle, LuHome, LuList, LuBed } from "react-icons/lu";

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((index) => (
            <Card 
              key={index} 
              className="p-6 animate-pulse"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Verifications Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuCheckCircle className="text-orange-500" />
                Pending Verifications
              </h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Listings Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuHome className="text-blue-500" />
                Recent Listings
              </h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-16 w-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories and Amenities Skeletons */}
          {['Listing Categories', 'Room Categories'].map((title, index) => (
            <Card key={title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {index === 0 ? 
                    <LuList className="text-green-500" /> : 
                    <LuBed className="text-purple-500" />
                  }
                  {title}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item}
                    className="h-12 bg-gray-200 rounded animate-pulse"
                    style={{ animationDelay: `${item * 100}ms` }}
                  />
                ))}
              </div>
            </Card>
          ))}

          {/* Amenities Management Skeleton */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LuList className="text-indigo-500" />
                Amenities Management
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div 
                  key={item}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                  style={{ animationDelay: `${item * 50}ms` }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 
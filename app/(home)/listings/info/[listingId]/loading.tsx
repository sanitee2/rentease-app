'use client';

import Container from "@/app/components/Container";

const LoadingState = () => {
  return (
      <div className="max-w-screen-xl mx-auto">
        {/* Image Section */}
        <div className="flex flex-col gap-6">
          <div className="w-full h-[60vh] overflow-hidden rounded-xl relative">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 md:gap-3 gap-2 mt-6">
          {/* Main Content */}
          <div className="md:col-span-5">
            {/* Header Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-8 w-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                  <div className="h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded-full" />
                  <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded-full" />
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((line) => (
                  <div key={line} className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                ))}
              </div>
            </section>

            {/* Amenities Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="h-6 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((amenity) => (
                  <div key={amenity} className="rounded-xl border p-4 flex items-start gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                      <div className="h-3 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Host Information Section */}
            <section className="bg-white rounded-xl border border-neutral-100 overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="h-6 w-36 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded mb-6" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded-full" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                    <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2">
            <div className="sticky top-20">
              <div className="rounded-xl border-[1px] border-neutral-200 overflow-hidden">
                <div className="flex flex-col gap-4 p-4">
                  <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                  <div className="h-[300px] w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                  <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default function Loading() {
  return <LoadingState />;
} 
import React from 'react';

const LoadingState = () => {
  return (
    <div className="w-full h-[calc(100vh-130px)] bg-gray-100 p-6 overflow-y-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 w-48 bg-gray-300 rounded mb-2" />
      <div className="h-4 w-64 bg-gray-200 rounded mb-6" />
      
      {/* Progress Bar Skeleton */}
      <div className="flex justify-between items-center mb-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="flex-1 h-8 bg-gray-300 mx-0.5"
          />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="flex flex-row gap-6">
        <div className="flex-grow-[3]">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            {/* Title Skeleton */}
            <div className="h-7 w-64 bg-gray-200 rounded mb-4" />
            <div className="h-5 w-48 bg-gray-100 rounded mb-6" />
            
            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="h-32 bg-gray-100 rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Skeleton */}
      <div className="flex flex-row items-center gap-4 w-full">
        <div className="h-12 w-32 bg-gray-300 rounded" />
        <div className="h-12 w-32 bg-gray-300 rounded" />
      </div>
    </div>
  );
};

export default LoadingState;

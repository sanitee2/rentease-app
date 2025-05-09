import Container from "@/app/components/Container";

const Loading = () => {
  return (
    <div className="pt-10 pb-10">
      <Container>
        <div className="flex flex-col gap-6">
          {/* Header Skeleton */}
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="w-[180px] h-10 bg-gray-200 rounded animate-pulse" />
              <div className="w-[180px] h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Requests List Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((index) => (
              <div 
                key={index}
                className="flex items-center justify-between border p-4 rounded-xl border-gray-100"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                  <div>
                    <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {[1, 2, 3].map((index) => (
              <div 
                key={index}
                className="w-8 h-8 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Loading; 
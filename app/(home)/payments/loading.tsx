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
              <div className="w-[180px] h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Maintenance Requests Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((index) => (
              <div 
                key={index}
                className="border p-4 rounded-xl border-gray-100"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                  <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Loading; 
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

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div 
                key={index}
                className="col-span-1 cursor-pointer group"
              >
                <div className="flex flex-col gap-2 w-full">
                  <div 
                    className="aspect-square w-full relative overflow-hidden rounded-xl bg-gray-200 animate-pulse"
                  />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
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
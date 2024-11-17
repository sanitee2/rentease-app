import Container from "@/app/components/Container";

const LoadingState = () => {
  const loadingCards = Array.from({ length: 8 }, (_, i) => i);

  return (
    <Container>
      <div className="pt-24">
        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4 
          xl:grid-cols-3 
          gap-8
        ">
          {loadingCards.map((index) => (
            <div 
              key={index}
              className="
                col-span-1 
                cursor-pointer 
                group
                animate-fade-in-up
              "
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Image Skeleton with Shimmer */}
              <div className="
                aspect-square 
                w-full 
                relative 
                overflow-hidden 
                rounded-xl 
                bg-gradient-to-r 
                from-gray-200 
                via-gray-300 
                to-gray-200 
                animate-shimmer
                bg-[length:200%_100%]
              "/>
              
              {/* Content Container */}
              <div className="mt-4 space-y-3">
                {/* Title Skeleton */}
                <div className="
                  h-4 
                  w-3/4 
                  bg-gradient-to-r 
                  from-gray-200 
                  via-gray-300 
                  to-gray-200 
                  animate-shimmer
                  bg-[length:200%_100%]
                  rounded
                "/>

                {/* Location Skeleton */}
                <div className="
                  h-4 
                  w-1/2 
                  bg-gradient-to-r 
                  from-gray-200 
                  via-gray-300 
                  to-gray-200 
                  animate-shimmer
                  bg-[length:200%_100%]
                  rounded
                "/>

                {/* Price Skeleton */}
                <div className="
                  h-4 
                  w-1/3 
                  bg-gradient-to-r 
                  from-gray-200 
                  via-gray-300 
                  to-gray-200 
                  animate-shimmer
                  bg-[length:200%_100%]
                  rounded
                "/>

                {/* Category Pills */}
                <div className="flex gap-2 mt-4">
                  {[1, 2].map((pill) => (
                    <div 
                      key={pill}
                      className="
                        h-6 
                        w-16 
                        bg-gradient-to-r 
                        from-gray-200 
                        via-gray-300 
                        to-gray-200 
                        animate-shimmer
                        bg-[length:200%_100%]
                        rounded-full
                      "
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default LoadingState; 
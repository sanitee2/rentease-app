import Container from "@/app/components/Container";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="h-[300px] bg-gradient-to-r from-indigo-900/90 to-indigo-800/90">
        <Container>
          <div className="h-full flex flex-col justify-center">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </Container>
      </div>

      {/* Content Skeletons */}
      <Container>
        <div className="py-16 space-y-16">
          {/* Who We Are Skeleton */}
          <section className="text-center max-w-3xl mx-auto space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </section>

          {/* Team Section Skeleton */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-4">
                  <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </section>

          {/* Why RentEase Skeleton */}
          <section className="space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="h-40 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
} 
import ClientOnly from "@/app/components/ClientOnly";

const LoadingState = () => {
  return (
    <div className="max-w-screen mx-auto">
      <div className="flex flex-col gap-6">
        <div className="w-full h-[60vh] overflow-hidden rounded-xl relative">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 md:gap-16 gap-2 mt-6">
        <div className="md:col-span-5">
          <div className="flex flex-col gap-8">
            <div className="flex flex-row items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
              <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
              <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
            </div>

            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((room) => (
                <div key={room} className="p-4 border rounded-lg">
                  <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
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
  );
};

export default function Loading() {
  return <LoadingState />;
} 
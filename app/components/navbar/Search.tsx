'use client';

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import useSearchModal from "@/app/hooks/useSearchModal";

const Search = () => {
  const router = useRouter();
  const searchModal = useSearchModal();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);

  // Get current search parameters
  const currentSearch = searchParams?.get('search');
  const currentLocation = searchParams?.get('location');
  const currentDates = searchParams?.get('dates');
  const currentGuests = searchParams?.get('guests');

  const handleSearch = useCallback(() => {
    const query: Record<string, any> = {};
    
    // Preserve existing search parameters
    if (currentSearch) query.search = currentSearch;
    if (currentLocation) query.location = currentLocation;
    if (currentDates) query.dates = currentDates;
    if (currentGuests) query.guests = currentGuests;

    const url = qs.stringifyUrl({
      url: '/listings',
      query
    }, { skipNull: true, skipEmptyString: true });

    router.push(url);
  }, [currentSearch, currentLocation, currentDates, currentGuests, router]);

  return (
    <div 
      onClick={searchModal.onOpen}
      className="
        border-[1px] 
        w-full 
        md:w-auto 
        py-2 
        rounded-full 
        shadow-sm 
        hover:shadow-md 
        transition 
        cursor-pointer
      "
    >
      <div 
        className="
          flex 
          flex-row 
          items-center 
          justify-between
        "
      >
        <div 
          className="
            text-sm 
            font-semibold 
            px-6
          "
        >
          {currentLocation || "Where"}
        </div>
        <div 
          className="
            hidden 
            sm:block 
            text-sm 
            font-semibold 
            px-6 
            border-x-[1px] 
            flex-1 
            text-center
          "
        >
          {currentDates || "Add dates"}
        </div>
        <div 
          className="
            text-sm 
            pl-6 
            pr-2 
            text-gray-600 
            flex 
            flex-row 
            items-center 
            gap-3
          "
        >
          <div className="hidden sm:block">{currentGuests || "Add guests"}</div>
          <div 
            className="
              p-2 
              bg-rose-500 
              rounded-full 
              text-white
            "
          >
            <SearchIcon size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
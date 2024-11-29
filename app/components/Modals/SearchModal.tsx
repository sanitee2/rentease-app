'use client';

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search as SearchIcon, X } from "lucide-react";
import useSearchModal from "@/app/hooks/useSearchModal";

const SearchModal = () => {
  const router = useRouter();
  const searchModal = useSearchModal();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    location: searchParams?.get('location') || '',
    dates: searchParams?.get('dates') || '',
    guests: searchParams?.get('guests') || ''
  });

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(() => {
    setIsSearching(true);

    const query: Record<string, any> = {};
    
    // Add all filters to query
    if (filters.search.trim()) query.search = filters.search.trim();
    if (filters.location.trim()) query.location = filters.location.trim();
    if (filters.dates.trim()) query.dates = filters.dates.trim();
    if (filters.guests.trim()) query.guests = filters.guests.trim();

    const url = qs.stringifyUrl({
      url: '/listings',
      query
    }, { skipNull: true, skipEmptyString: true });

    router.push(url);
    searchModal.onClose();
    setIsSearching(false);
  }, [filters, router, searchModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Input
          placeholder="Search destinations"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            location: e.target.value
          }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="pl-9 bg-neutral-50 border-neutral-200 focus-visible:ring-rose-500"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          <SearchIcon size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Check in"
          value={filters.dates}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            dates: e.target.value
          }))}
          className="bg-neutral-50 border-neutral-200 focus-visible:ring-rose-500"
        />
        <Input
          placeholder="Check out"
          value={filters.dates}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            dates: e.target.value
          }))}
          className="bg-neutral-50 border-neutral-200 focus-visible:ring-rose-500"
        />
      </div>

      <Input
        placeholder="Add guests"
        value={filters.guests}
        onChange={(e) => setFilters(prev => ({
          ...prev,
          guests: e.target.value
        }))}
        className="bg-neutral-50 border-neutral-200 focus-visible:ring-rose-500"
      />

      <Button
        onClick={handleSearch}
        className="bg-rose-500 hover:bg-rose-600 text-white"
        disabled={isSearching}
      >
        {isSearching ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );

  return (
    <Dialog open={searchModal.isOpen} onOpenChange={searchModal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Search</h3>
          <Button
            onClick={searchModal.onClose}
            variant="ghost"
            size="sm"
          >
            <X size={18} />
          </Button>
        </div>
        {bodyContent}
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal; 
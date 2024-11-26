'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LuEye } from "react-icons/lu";
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  title: string;
  status: string;
  landlord: string;
  date: string;
}

export default function RecentListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const response = await fetch('/api/admin/listings/recent');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching recent listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentListings();
  }, []);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: 'outline' as const,
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'pending':
        return {
          variant: 'outline' as const,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      case 'declined':
        return {
          variant: 'outline' as const,
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  // Always limit to 4 entries
  const displayedListings = listings.slice(0, 4);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {listings.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No listings available
        </div>
      ) : (
        <div className="space-y-4">
          {displayedListings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:border-indigo-200 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-medium">{listing.title}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{listing.landlord}</span>
                  <span>•</span>
                  <span>{listing.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  {...getBadgeVariant(listing.status)}
                  className={`capitalize ${getBadgeVariant(listing.status).className}`}
                >
                  {listing.status}
                </Badge>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="hover:text-indigo-600"
                  onClick={() => router.push(`/admin/listings/${listing.id}`)}
                >
                  <LuEye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
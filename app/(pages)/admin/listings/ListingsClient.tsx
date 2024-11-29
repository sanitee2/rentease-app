'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LuEye, LuSearch, LuArrowLeft } from "react-icons/lu";
import { ListingStatus, PricingType } from "@prisma/client";
import TableSkeleton from '@/app/components/skeletons/TableSkeleton';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import AdminListingModal from "@/app/components/Modals/AdminListingModal";
import { SafeListing, SafeUser } from '@/app/types';


interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

interface ListingsClientProps {
  initialListings: SafeListing[];
  pagination: PaginationData;
  currentUser: SafeUser | null;
}

const ListingsClient = ({ 
  initialListings, 
  pagination,
  currentUser,
}: ListingsClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<SafeListing[]>(initialListings);
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredListings, setFilteredListings] = useState<SafeListing[]>(initialListings);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SafeListing | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);



  const initialTab = searchParams?.get('status') || 'ALL';

  // Filter listings based on search query and status
  useEffect(() => {
    if (!listings) return;
    
    let filtered = [...listings];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.landlordProfileId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter if not empty (meaning not "ALL")
    if (initialTab && initialTab !== 'ALL') {
      filtered = filtered.filter((listing) => listing.status === initialTab);
    }

    setFilteredListings(filtered);
    setCurrentPage(1);
  }, [listings, searchQuery, initialTab]);

  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setCurrentPage(1);
    if (value === 'ALL') {
      router.push(`/admin/listings?page=1`);
    } else {
      router.push(`/admin/listings?status=${value}&page=1`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const status = searchParams?.get('status');
    const search = searchParams?.get('search') || '';
    
    let url = `/admin/listings?page=${page}`;
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    if (search) {
      url += `&search=${search}`;
    }
    
    router.push(url);
  };


  const getPricingBadge = (pricingType: PricingType) => {
    const variants = {
      ROOM_BASED: 'bg-blue-50 text-blue-700 border-blue-200',
      LISTING_BASED: 'bg-purple-50 text-purple-700 border-purple-200'
    };

    return (
      <Badge 
        variant="outline" 
        className={variants[pricingType]}
      >
        {pricingType === 'ROOM_BASED' ? 'Per Room' : 'Whole Unit'}
      </Badge>
    );
  };

  const getStatusBadge = (status: ListingStatus) => {
    const variants = {
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      DECLINED: 'bg-red-50 text-red-700 border-red-200',
      ARCHIVED: 'bg-gray-50 text-gray-700 border-gray-200'
    };

    return (
      <Badge 
        variant="outline" 
        className={variants[status]}
      >
        {status.toWellFormed()}
      </Badge>
    );
  };

  const handleView = (listing: SafeListing) => {
    setSelectedListing(listing);
    setIsViewModalOpen(true);
  };

  const refreshListings = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = searchParams?.get('status');
      const page = searchParams?.get('page') || '1';
      const search = searchParams?.get('search') || '';
      
      const url = status && status !== 'ALL' 
        ? `/api/admin/listings?status=${status}&page=${page}&search=${search}`
        : `/api/admin/listings?page=${page}&search=${search}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setListings(data.listings);
      setFilteredListings(data.listings);
    } catch (error) {
      console.error('Error refreshing listings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const renderListingsTable = () => {
    if (!filteredListings || filteredListings.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          No listings found
        </div>
      );
    }

    return (
      <>
        <div className="py-4 border-b">
          <div className="relative max-w-xs">
            <label className="sr-only">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search listings..."
            />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <LuSearch className="size-4 text-gray-400" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Landlord</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Pricing Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">
                  {listing.title}
                </TableCell>
                <TableCell>{listing.category}</TableCell>
                <TableCell>
                  {listing.user?.firstName} {listing.user?.lastName}
                </TableCell>
                <TableCell>
                  {listing.user?.phoneNumber}
                </TableCell>
                <TableCell>
                  {getPricingBadge(listing.pricingType)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(listing.status)}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(listing)}
                  >
                    <LuEye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="py-4 px-6 border-t border-gray-100">
          <nav className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </nav>
        </div>
        

        {selectedListing && (
          <AdminListingModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            listing={selectedListing}
            user={selectedListing.user || null}
            currentUser={currentUser}
            onAction={refreshListings}
          />
        )}
      </>
    );
  };

  useEffect(() => {
    setIsLoading(false);
  }, [filteredListings]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
        >
          <LuArrowLeft className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Listings</h1>
      </div>
      
      <Breadcrumbs />

      <Tabs 
        defaultValue={initialTab} 
        className=""
        onValueChange={handleTabChange}
      >
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="DECLINED">Declined</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
        </TabsList>

        {['ALL', 'PENDING', 'ACTIVE', 'DECLINED', 'ARCHIVED'].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              renderListingsTable()
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface LandlordNameProps {
  listing: SafeListing & {
    user?: SafeUser;
  };
}

const LandlordName = ({ listing }: LandlordNameProps) => {
  const displayName = useMemo(() => {
    if (!listing.user) return 'N/A';
    return `${listing.user.firstName} ${listing.user.lastName}`.trim() || 'N/A';
  }, [listing.user]);
  
  return <span>{displayName}</span>;
};

const LandlordContact = ({ listing }: LandlordNameProps) => {
  const contact = useMemo(() => {
    if (!listing.user) return 'N/A';
    return listing.user.phoneNumber || 
      listing.user.email || 
      'N/A';
  }, [listing.user]);
  
  return <span>{contact}</span>;
};

export default ListingsClient; 
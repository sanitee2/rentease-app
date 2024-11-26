'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PendingListing {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function PendingListings() {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingListings = async () => {
      try {
        const response = await fetch('/api/admin/listings/pending');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching pending listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingListings();
  }, []);

  const handleAction = async (listingId: string, action: 'approve' | 'decline') => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'ACTIVE' : 'DECLINED' })
      });

      if (response.ok) {
        setListings(listings.filter(listing => listing.id !== listingId));
      }
    } catch (error) {
      console.error('Error updating listing status:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {listings.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No pending listings to verify
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-50/50">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Landlord</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-indigo-900">{listing.title}</TableCell>
                <TableCell>{listing.category}</TableCell>
                <TableCell>{`${listing.user.firstName} ${listing.user.lastName}`}</TableCell>
                <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleAction(listing.id, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="hover:bg-red-700"
                      onClick={() => handleAction(listing.id, 'decline')}
                    >
                      Decline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 
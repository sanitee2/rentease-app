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

interface PendingLandlord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  businessName: string | null;
}

export default function PendingLandlords() {
  const [landlords, setLandlords] = useState<PendingLandlord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingLandlords = async () => {
      try {
        const response = await fetch('/api/admin/landlords/pending');
        const data = await response.json();
        setLandlords(data);
      } catch (error) {
        console.error('Error fetching pending landlords:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLandlords();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {landlords.map((landlord) => (
            <TableRow key={landlord.id}>
              <TableCell className="font-medium">
                {landlord.firstName} {landlord.lastName}
              </TableCell>
              <TableCell>{landlord.businessName || '-'}</TableCell>
              <TableCell>{new Date(landlord.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    Review
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
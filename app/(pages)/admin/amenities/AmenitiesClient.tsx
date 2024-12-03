'use client';

import { useState } from 'react';
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
import { LuSearch, LuArrowLeft, LuPencil } from "react-icons/lu";
import Breadcrumbs from '@/app/components/Breadcrumbs';
import * as FaIcons from 'react-icons/fa';
import { IconType } from 'react-icons';
import { PropertyAmenityCategory, RoomAmenityCategory } from '@prisma/client';
import AmenityModal from "@/app/(pages)/admin/dashboard/components/AmenityModal";

interface Amenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
  category: PropertyAmenityCategory | RoomAmenityCategory;
  arrangement: number;
}

interface AmenitiesClientProps {
  propertyAmenities: Amenity[];
  roomAmenities: Amenity[];
}

const AmenitiesClient = ({ propertyAmenities, roomAmenities }: AmenitiesClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [amenityType, setAmenityType] = useState<'property' | 'room'>('property');

  const initialTab = searchParams?.get('type') || 'property';

  const handleTabChange = (value: string) => {
    setAmenityType(value as 'property' | 'room');
    router.push(`/admin/amenities?type=${value}`);
  };

  const handleAdd = () => {
    setSelectedAmenity(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setIsAddModalOpen(true);
  };

  const getCategoryBadge = (category: PropertyAmenityCategory | RoomAmenityCategory) => {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {category.replace(/_/g, ' ')}
      </Badge>
    );
  };

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
        <h1 className="text-2xl font-bold">Amenities</h1>
      </div>
      
      <Breadcrumbs />

      <Tabs 
        defaultValue={initialTab} 
        onValueChange={handleTabChange}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="property">Property Amenities</TabsTrigger>
            <TabsTrigger value="room">Room Amenities</TabsTrigger>
          </TabsList>

          <Button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Add Amenity
          </Button>
        </div>

        <div className="py-4 border-b">
          <div className="relative max-w-xs">
            <label className="sr-only">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search amenities..."
            />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <LuSearch className="size-4 text-gray-400" />
            </div>
          </div>
        </div>

        <TabsContent value="property">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyAmenities.map((amenity) => {
                const Icon: IconType = FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaQuestion;
                return (
                  <TableRow key={amenity.id}>
                    <TableCell>
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 w-fit">
                        <Icon size={16} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{amenity.title}</TableCell>
                    <TableCell>{amenity.desc}</TableCell>
                    <TableCell>{getCategoryBadge(amenity.category)}</TableCell>
                    <TableCell>{amenity.arrangement}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(amenity)}
                      >
                        <LuPencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="room">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomAmenities.map((amenity) => {
                const Icon: IconType = FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaQuestion;
                return (
                  <TableRow key={amenity.id}>
                    <TableCell>
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 w-fit">
                        <Icon size={16} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{amenity.title}</TableCell>
                    <TableCell>{amenity.desc}</TableCell>
                    <TableCell>{getCategoryBadge(amenity.category)}</TableCell>
                    <TableCell>{amenity.arrangement}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(amenity)}
                      >
                        <LuPencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <AmenityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        amenityType={amenityType}
        initialData={selectedAmenity}
        onSuccess={() => {
          setIsAddModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
};

export default AmenitiesClient; 
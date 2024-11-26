'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuPlus, LuX, LuArrowLeft } from "react-icons/lu";
import { useRouter } from 'next/navigation';

interface Amenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export default function AmenitiesPage() {
  const router = useRouter();
  const [propertyAmenities, setPropertyAmenities] = useState<Amenity[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<Amenity[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(true);

  // ... same fetch logic as AmenitiesManager ...

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

      <Tabs defaultValue="property" className="w-full">
        <TabsList>
          <TabsTrigger value="property">Property Amenities</TabsTrigger>
          <TabsTrigger value="room">Room Amenities</TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="mt-4">
          {/* Full property amenities list */}
        </TabsContent>

        <TabsContent value="room" className="mt-4">
          {/* Full room amenities list */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
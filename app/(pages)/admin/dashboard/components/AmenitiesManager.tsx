'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuPlus, LuX } from "react-icons/lu";
import { useRouter } from 'next/navigation';

interface Amenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export default function AmenitiesManager() {
  const router = useRouter();
  const [propertyAmenities, setPropertyAmenities] = useState<Amenity[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<Amenity[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const [propertyRes, roomRes] = await Promise.all([
          fetch('/api/admin/amenities/property'),
          fetch('/api/admin/amenities/room')
        ]);
        const [propertyData, roomData] = await Promise.all([
          propertyRes.json(),
          roomRes.json()
        ]);
        setPropertyAmenities(propertyData);
        setRoomAmenities(roomData);
      } catch (error) {
        console.error('Error fetching amenities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const handleAddAmenity = async (type: 'property' | 'room') => {
    if (newAmenity.trim()) {
      try {
        const response = await fetch(`/api/admin/amenities/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newAmenity.trim(),
            icon: 'default-icon',
            desc: ''
          })
        });
        const newItem = await response.json();
        
        if (type === 'property') {
          setPropertyAmenities([...propertyAmenities, newItem]);
        } else {
          setRoomAmenities([...roomAmenities, newItem]);
        }
        setNewAmenity('');
      } catch (error) {
        console.error('Error adding amenity:', error);
      }
    }
  };

  const displayedPropertyAmenities = propertyAmenities.slice(0, 4);
  const displayedRoomAmenities = roomAmenities.slice(0, 4);

  if (loading) return <div>Loading...</div>;

  return (
    <Tabs defaultValue="property" className="w-full">
      <TabsList>
        <TabsTrigger value="property">Property Amenities</TabsTrigger>
        <TabsTrigger value="room">Room Amenities</TabsTrigger>
      </TabsList>

      <TabsContent value="property" className="mt-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new property amenity..."
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => handleAddAmenity('property')}>
              <LuPlus className="mr-2" />
              Add
            </Button>
          </div>

          {propertyAmenities.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No property amenities added yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {displayedPropertyAmenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div>
                    <span className="font-medium">{amenity.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {amenity.desc}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <LuX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="room" className="mt-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new room amenity..."
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => handleAddAmenity('room')}>
              <LuPlus className="mr-2" />
              Add
            </Button>
          </div>

          {roomAmenities.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No room amenities added yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {displayedRoomAmenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div>
                    <span className="font-medium">{amenity.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {amenity.desc}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <LuX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
} 
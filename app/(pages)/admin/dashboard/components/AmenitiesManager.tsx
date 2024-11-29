'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuPlus, LuX, LuPencil } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import AmenityModal from './AmenityModal';
import { PropertyAmenityCategory, RoomAmenityCategory } from '@prisma/client';
import * as FaIcons from 'react-icons/fa';
import { IconType } from 'react-icons';

interface BaseAmenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

interface PropertyAmenity extends BaseAmenity {}

interface RoomAmenity extends BaseAmenity {
  category: string;
  arrangement: string;
}

type Amenity = {
  id: string;
  title: string;
  icon: string;
  desc: string;
  category: PropertyAmenityCategory | RoomAmenityCategory;
  arrangement: number;
};

export default function AmenitiesManager() {
  const router = useRouter();
  const [propertyAmenities, setPropertyAmenities] = useState<Amenity[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<Amenity[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<'property' | 'room'>('property');

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
        const category = type === 'property' ? PropertyAmenityCategory.UTILITIES : RoomAmenityCategory.ACCESS;
        const response = await fetch(`/api/admin/amenities/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newAmenity.trim(),
            icon: 'default-icon',
            desc: '',
            category,
            arrangement: 0,
          }),
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

  const handleEditSuccess = () => {
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
    setEditingAmenity(null);
  };

  const displayedPropertyAmenities = propertyAmenities.slice(0, 4);
  const displayedRoomAmenities = roomAmenities.slice(0, 4);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Tabs 
            defaultValue="property" 
            onValueChange={(value: string) => setActiveType(value as 'property' | 'room')}
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="property">Property Amenities</TabsTrigger>
                <TabsTrigger value="room">Room Amenities</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  size="sm"
                  className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <LuPlus className="w-4 h-4" />
                  Add
                </Button>
                {(propertyAmenities.length > 4 || roomAmenities.length > 4) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/admin/amenities')}
                    className="text-indigo-500 border-indigo-500 hover:bg-indigo-50"
                  >
                    View All
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="property" className="mt-4">
              <div className="space-y-4">
                {propertyAmenities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No property amenities added yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {displayedPropertyAmenities.map((amenity) => {
                      const Icon: IconType = FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaBuilding;
                      
                      return (
                        <div
                          key={amenity.id}
                          className="flex items-center justify-between p-2 rounded-md border border-gray-200 hover:border-indigo-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                              <Icon size={16} />
                            </div>
                            <span className="font-medium text-gray-900">{amenity.title}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingAmenity(amenity)}
                          >
                            <LuPencil className="h-4 w-4 text-indigo-600" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="room" className="mt-4">
              <div className="space-y-4">
                {roomAmenities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No room amenities added yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {displayedRoomAmenities.map((amenity) => {
                      const Icon: IconType = FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaQuestion;
                      
                      return (
                        <div
                          key={amenity.id}
                          className="flex items-center justify-between p-2 rounded-md border border-gray-200 hover:border-indigo-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                              <Icon size={16} />
                            </div>
                            <span className="font-medium text-gray-900">{amenity.title}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingAmenity(amenity)}
                          >
                            <LuPencil className="h-4 w-4 text-indigo-600" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AmenityModal 
        isOpen={!!editingAmenity}
        onClose={() => setEditingAmenity(null)}
        onSuccess={handleEditSuccess}
        initialData={editingAmenity}
        amenityType={activeType}
      />

      <AmenityModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleEditSuccess}
        amenityType={activeType}
      />
    </div>
  );
} 
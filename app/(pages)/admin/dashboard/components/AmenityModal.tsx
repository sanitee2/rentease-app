'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modals/Modal';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';

type PropertyAmenityCategory = 'UTILITIES' | 'SECURITY' | 'PARKING' | 'SHARED_FACILITIES' | 'RECREATION' | 'BUILDING_SERVICES' | 'APPLIANCES';
type RoomAmenityCategory = 'ENTERTAINMENT' | 'FURNITURE' | 'BATHROOM' | 'ACCESS' | 'APPLIANCES' | 'DECOR' | 'ROOM_COMFORT';

interface BaseAmenity {
  id?: string;
  title: string;
  icon: string;
  desc: string;
  arrangement: number;
}

interface PropertyAmenity extends BaseAmenity {
  category: PropertyAmenityCategory;
}

interface RoomAmenity extends BaseAmenity {
  category: RoomAmenityCategory;
}

type Amenity = {
  id: string;
  title: string;
  icon: string;
  desc: string;
  category: PropertyAmenityCategory | RoomAmenityCategory;
  arrangement: number;
};

type FormData = {
  title: string;
  desc: string;
  icon: string;
  category: PropertyAmenityCategory | RoomAmenityCategory;
  arrangement: number;
};

interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Amenity | null;
  amenityType: 'property' | 'room';
}

const propertyCategories: PropertyAmenityCategory[] = ['UTILITIES', 'SECURITY', 'PARKING', 'SHARED_FACILITIES', 'RECREATION', 'BUILDING_SERVICES', 'APPLIANCES'];
const roomCategories: RoomAmenityCategory[] = ['ENTERTAINMENT', 'FURNITURE', 'BATHROOM', 'ACCESS', 'APPLIANCES', 'DECOR', 'ROOM_COMFORT'];

const getInitialFormData = (amenityType: 'property' | 'room'): FormData => ({
  title: '',
  desc: '',
  icon: '',
  category: amenityType === 'property' ? 'UTILITIES' : 'ACCESS',
  arrangement: 0
});

export default function AmenityModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  amenityType
}: AmenityModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => 
    initialData ? {
      title: initialData.title,
      desc: initialData.desc,
      icon: initialData.icon,
      category: initialData.category,
      arrangement: initialData.arrangement
    } : getInitialFormData(amenityType)
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        desc: initialData.desc,
        icon: initialData.icon,
        category: initialData.category,
        arrangement: initialData.arrangement
      });
    } else {
      setFormData(getInitialFormData(amenityType));
    }
  }, [initialData, amenityType]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!formData.title || !formData.desc) {
        toast.error('Please fill in all required fields');
        return;
      }

      const url = `/api/admin/amenities/${amenityType}${initialData ? `/${initialData.id}` : ''}`;
      const method = initialData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save amenity');
      }

      toast.success(`Amenity ${initialData ? 'updated' : 'created'} successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error saving amenity');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = amenityType === 'property' ? propertyCategories : roomCategories;

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter amenity title"
        />
      </div>
      
      <div>
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          placeholder="Enter amenity description"
        />
      </div>

      <div>
        <Label htmlFor="icon">Icon Name</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="Enter icon name"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value: any) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="arrangement">Arrangement Order</Label>
        <Input
          id="arrangement"
          type="number"
          value={formData.arrangement}
          onChange={(e) => setFormData({ ...formData, arrangement: parseInt(e.target.value) })}
          placeholder="Enter display order"
        />
      </div>
    </div>
  );

  return (
    <Modal
      title={`${initialData ? 'Edit' : 'Add New'} ${amenityType} Amenity`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      actionLabel={initialData ? 'Save Changes' : 'Create'}
      body={bodyContent}
      disabled={isLoading}
      size="sm"
    />
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modals/Modal';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import toast from 'react-hot-toast';

interface RoomCategory {
  id: string;
  title: string;
  desc: string;
  icon: string;
  needsMaxTenant: boolean;
}

interface ListingCategory extends RoomCategory {
  pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  roomTypes: string[];
}

interface FormData extends RoomCategory {
  pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  roomTypes: string[];
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: 'listing' | 'room';
  onSuccess?: () => void;
  initialData?: RoomCategory | ListingCategory | null;
}

const initialFormData: FormData = {
  id: '',
  title: '',
  desc: '',
  icon: '',
  needsMaxTenant: false,
  pricingType: 'LISTING_BASED',
  roomTypes: []
};

const convertToFormData = (data: RoomCategory | ListingCategory | null | undefined): FormData => {
  if (!data) return initialFormData;
  
  return {
    ...data,
    pricingType: 'pricingType' in data ? data.pricingType : 'LISTING_BASED',
    roomTypes: 'roomTypes' in data ? data.roomTypes : [],
  };
};

const AddCategoryModal = ({ 
  isOpen, 
  onClose,
  categoryType,
  onSuccess,
  initialData 
}: AddCategoryModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(convertToFormData(initialData));

  useEffect(() => {
    setFormData(convertToFormData(initialData));
  }, [initialData]);

  const resetForm = () => {
    setFormData(convertToFormData(initialData));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!formData.title || !formData.desc || !formData.icon) {
        toast.error('Please fill in all required fields');
        return;
      }

      const method = initialData ? 'PATCH' : 'POST';
      const url = initialData 
        ? `/api/admin/categories/${categoryType}/${initialData.id}`
        : `/api/admin/categories/${categoryType}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          icon: formData.icon,
          desc: formData.desc,
          needsMaxTenant: formData.needsMaxTenant,
          ...(categoryType === 'listing' && { 
            pricingType: formData.pricingType,
            roomTypes: formData.roomTypes
          })
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${initialData ? 'update' : 'create'} category`);
      }

      toast.success(`Category ${initialData ? 'updated' : 'created'} successfully`);
      onSuccess?.();
      resetForm();
      handleClose();
      
    } catch (error) {
      toast.error(`Error ${initialData ? 'updating' : 'creating'} category`);
    } finally {
      setIsLoading(false);
    }
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="title" className="text-gray-700">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev: FormData) => ({ ...prev, title: e.target.value }))}
          placeholder="Enter category title"
          className="focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <Label htmlFor="desc" className="text-gray-700">Description</Label>
        <Textarea
          id="desc"
          value={formData.desc}
          onChange={(e) => setFormData((prev: FormData) => ({ ...prev, desc: e.target.value }))}
          placeholder="Enter category description"
          className="focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <Label htmlFor="icon" className="text-gray-700">Icon Name</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData((prev: FormData) => ({ ...prev, icon: e.target.value }))}
          placeholder="Enter icon name"
          className="focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.needsMaxTenant}
          onCheckedChange={(checked) => 
            setFormData((prev: FormData) => ({ ...prev, needsMaxTenant: checked }))
          }
          className="data-[state=checked]:bg-indigo-500"
        />
        <Label className="text-gray-700">Requires Maximum Tenant</Label>
      </div>
      {categoryType === 'listing' && (
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.pricingType === 'ROOM_BASED'}
            onCheckedChange={(checked) => 
              setFormData((prev: FormData) => ({ 
                ...prev, 
                pricingType: checked ? 'ROOM_BASED' : 'LISTING_BASED' 
              }))
            }
            className="data-[state=checked]:bg-indigo-500"
          />
          <Label className="text-gray-700">Room-based Pricing</Label>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      title={`${initialData ? 'Edit' : 'Add New'} ${categoryType === 'listing' ? 'Listing' : 'Room'} Category`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      actionLabel={initialData ? 'Save Changes' : 'Create'}
      body={bodyContent}
      disabled={isLoading}
      size="sm"
    />
  );
};

export default AddCategoryModal; 
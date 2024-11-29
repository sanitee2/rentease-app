'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LuPencil } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import * as FaIcons from 'react-icons/fa';
import { IconType } from 'react-icons';
import AddCategoryModal from './AddCategoryModal';

interface ListingCategory {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needsMaxTenant: boolean;
  pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  roomTypes: string[];
}

export default function ListingCategories() {
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ListingCategory | null>(null);
  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories/listing');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching listing categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditSuccess = () => {
    fetchCategories();
    setEditingCategory(null);
  };

  const displayedCategories = categories.slice(0, 4);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No listing categories added yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {displayedCategories.map((category) => {
            const Icon: IconType = FaIcons[category.icon as keyof typeof FaIcons] || FaIcons.FaHome;
            
            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-2 rounded-md border border-gray-200 hover:border-indigo-100"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Icon size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{category.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                >
                  <LuPencil className="h-4 w-4 text-indigo-600" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {categories.length > 4 && (
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/categories')}
          className="w-full text-indigo-500 border-indigo-500 hover:bg-indigo-50"
        >
          View All Categories
        </Button>
      )}

      <AddCategoryModal 
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        categoryType="listing"
        onSuccess={handleEditSuccess}
        initialData={editingCategory}
      />
    </div>
  );
} 
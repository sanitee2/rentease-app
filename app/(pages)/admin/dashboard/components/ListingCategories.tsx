'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LuPlus, LuX } from "react-icons/lu";
import { useRouter } from 'next/navigation';

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
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await fetch('/api/admin/categories/listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newCategory.trim(),
            icon: 'default-icon',
            desc: '',
            needsMaxTenant: false,
            pricingType: 'LISTING_BASED'
          })
        });
        const newCat = await response.json();
        setCategories([...categories, newCat]);
        setNewCategory('');
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const displayedCategories = categories.slice(0, 4);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add new category..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleAddCategory}>
          <LuPlus className="mr-2" />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No listing categories added yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {displayedCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div>
                <span className="font-medium">{category.title}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.pricingType}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <LuX className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {categories.length > 4 && (
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/categories')}
          className="w-full"
        >
          View All Categories
        </Button>
      )}
    </div>
  );
} 
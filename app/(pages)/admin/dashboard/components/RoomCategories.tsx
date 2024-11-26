'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LuPlus, LuX } from "react-icons/lu";

interface RoomCategory {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needsMaxTenant: boolean;
}

export default function RoomCategories() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories/room');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching room categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await fetch('/api/admin/categories/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newCategory.trim(),
            icon: 'default-icon',
            desc: '',
            needsMaxTenant: false
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add new room type..."
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
          No room categories added yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div>
                <span className="font-medium">{category.title}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.needsMaxTenant ? 'Max Tenant' : 'No Max'}
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
  );
} 
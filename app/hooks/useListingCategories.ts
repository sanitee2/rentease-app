// hooks/useListingCategories.ts

import { useState, useEffect } from 'react';
import { ListingCategory } from '@/app/types';

const useListingCategories = () => {
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/listing');
        const data: ListingCategory[] = await res.json();
        setCategories(data);
      } catch (err) {
        setError('Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const selectCategory = (categoryTitle: string) => {
    const category = categories.find(cat => cat.title === categoryTitle);
    setSelectedCategory(category || null);
  };

  return { 
    categories, 
    loading, 
    error, 
    selectedCategory,
    selectCategory 
  };
};

export default useListingCategories;

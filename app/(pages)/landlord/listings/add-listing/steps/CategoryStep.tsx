import React from 'react';
import { ListingCategory } from '@/app/types';
import CategoryInput from '@/app/components/inputs/CategoryInput';
import Heading from '@/app/components/Heading';
import { getIconComponent } from '@/lib/utils';

interface CategoryStepProps {
  categories: ListingCategory[];
  selectedCategory: string;
  setCustomValue: (id: string, value: any) => void;
}

const CategoryStep: React.FC<CategoryStepProps> = ({ categories, selectedCategory, setCustomValue }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-6">
      <Heading title="Which of these best describes your place?" subtitle="Pick a category" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
        {categories.map((item: ListingCategory) => (
          <CategoryInput
            key={item.id}
            onClick={(category) => setCustomValue('category', category)}
            selected={selectedCategory === item.title}
            label={item.title}
            icon={getIconComponent(item.icon)} // Dynamically set the icon
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryStep; 
import React from 'react';
import type { IconType } from 'react-icons';

interface CategoryInputProps {
  icon: IconType;
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
  icon: Icon, // Icon is passed as a component
  label,
  selected,
  onClick
}) => {
  return (
    <div
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        border
        p-4
        flex
        flex-row
        gap-3
        hover:border-indigo-800
        hover:bg-indigo-50
        hover:text-indigo-800
        transition
        cursor-pointer
        ${selected ? 'border-indigo-800 text-indigo-800 bg-indigo-50' : 'border-neutral-200'}
      `}
    >
      <Icon size={20} /> {/* Render the icon component */}
      <div className="font-semibold">
        {label}
      </div>
    </div>
  );
};

export default CategoryInput;

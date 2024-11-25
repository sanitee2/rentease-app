import React from 'react'

interface CategoryListingProps {
  category: string
}

const CategoryListing: React.FC<CategoryListingProps> = ({
  category
}) => {
  return (
    <div className="
      px-3 
      py-1.5 
      rounded-lg 
      bg-white/90 
      backdrop-blur-sm 
      border 
      border-indigo-100 
      text-indigo-700 
      text-sm 
      font-medium 
      shadow-sm
      transition-all 
      duration-300
    ">
      {category}
    </div>
  )
}

export default CategoryListing
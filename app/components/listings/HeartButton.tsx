'use client'

import useFavorite from '@/app/hooks/useFavorite'
import { SafeUser } from '@/app/types'
import React, { useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { toast } from "react-hot-toast"

interface HeartButtonProps {
  listingId: string
  currentUser?: SafeUser | null
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  currentUser
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId,
    currentUser
  });

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!currentUser) {
      return toast.error('Please login to save favorites');
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      await toggleFavorite();
      toast.success(
        hasFavorited 
          ? 'Removed from favorites' 
          : 'Added to favorites'
      );
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative
        group
        rounded-full
        p-2
        hover:bg-black/5
        transition-all
        duration-200
        ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        ${hasFavorited ? 'hover:scale-110' : 'hover:scale-105'}
      `}
      aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* Outline Heart */}
      <AiOutlineHeart
        size={27}
        className={`
          absolute
          inset-0
          m-auto
          transition-opacity
          duration-300
          stroke-[2]
          ${hasFavorited ? 'opacity-0' : 'opacity-100'}
          ${isLoading ? 'text-neutral-400' : 'text-white'}
        `}
      />

      {/* Filled Heart */}
      <AiFillHeart
        size={25}
        className={`
          transition-all
          duration-300
          ${hasFavorited 
            ? 'text-rose-500 scale-100 opacity-100' 
            : 'text-neutral-500 scale-90 opacity-50'
          }
          ${isLoading && 'opacity-50'}
        `}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="
          absolute 
          inset-0 
          flex 
          items-center 
          justify-center 
          bg-white/20 
          rounded-full
        ">
          <div className="
            w-4 
            h-4 
            border-2 
            border-neutral-300 
            border-t-indigo-600 
            rounded-full 
            animate-spin
          "/>
        </div>
      )}
    </button>
  );
};

export default HeartButton;
'use client';

import { SafeUser } from '@/app/types';
import React, { useState } from 'react';
import Image from 'next/image';
import HeartButton from './HeartButton';
import FullScreenGallery from '../FullScreenGallery';

interface ListingHeadProps {
  imageSrc: string[];
  id: string;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ imageSrc, id, currentUser }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsFullScreen(true);
  };

  return (
    <>
      {isFullScreen && (
        <FullScreenGallery 
          images={imageSrc} 
          onClose={() => setIsFullScreen(false)}
          initialIndex={selectedImageIndex}
        />
      )}

      <div className="relative">
        {imageSrc.length === 1 ? (
          // Single image layout
          <div className="relative h-[60vh] overflow-hidden rounded-xl">
            <Image
              alt="property"
              src={imageSrc[0]}
              fill
              className="object-cover w-full cursor-pointer"
              onClick={() => handleImageClick(0)}
            />
          </div>
        ) : imageSrc.length === 2 ? (
          // Two images layout - first image takes 2 columns
          <div className="grid grid-cols-3 gap-4 h-[60vh]">
            <div className="col-span-2 relative overflow-hidden rounded-xl">
              <Image
                alt="main-image"
                src={imageSrc[0]}
                fill
                className="object-cover w-full cursor-pointer hover:scale-105 transition"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <Image
                alt="second-image"
                src={imageSrc[1]}
                fill
                className="object-cover w-full cursor-pointer hover:scale-105 transition"
                onClick={() => handleImageClick(1)}
              />
            </div>
          </div>
        ) : (
          // Three or more images layout
          <div className="grid grid-cols-3 gap-4 h-[60vh]">
            <div className="col-span-2 relative overflow-hidden rounded-xl">
              <Image
                alt="main-image"
                src={imageSrc[0]}
                fill
                className="object-cover w-full cursor-pointer hover:scale-105 transition"
                onClick={() => handleImageClick(0)}
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {imageSrc.slice(1, 3).map((src, index) => (
                <div
                  key={index}
                  className="relative h-1/2 overflow-hidden rounded-xl"
                >
                  <Image
                    alt={`image-${index + 1}`}
                    src={src}
                    fill
                    className="object-cover w-full cursor-pointer hover:scale-105 transition"
                    onClick={() => handleImageClick(index + 1)}
                  />
                  {index === 1 && imageSrc.length > 3 && (
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-40 
                        flex flex-col items-center justify-center cursor-pointer
                        hover:bg-opacity-30 transition gap-2"
                      onClick={() => handleImageClick(2)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white text-2xl font-medium">
                          +{imageSrc.length - 3}
                        </span>
                      </div>
                      <button 
                        className="px-4 py-2 bg-white text-gray-900 rounded-full
                          text-sm font-semibold hover:bg-gray-100 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullScreen(true);
                        }}
                      >
                        View all pictures
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListingHead;

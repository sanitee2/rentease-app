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

  const handleImageClick = () => {
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
  };

  return (
    <>
      {isFullScreen ? (
        <FullScreenGallery images={imageSrc} onClose={handleCloseFullScreen} />
      ) : (
        <div className="relative">
          {/* Grid Layout for Main Image and Two Smaller Images */}
          <div className="grid grid-cols-3 gap-2 mt-4 relative">

            {/* Heart Button */}
            <div className="absolute top-5 right-5 z-10">
              <HeartButton listingId={id} currentUser={currentUser} />
            </div>

            {/* Main Large Image (Spanning 2 rows) */}
            {imageSrc[0] && (
              <div className="relative col-span-2 row-span-2 h-[49vh] overflow-hidden rounded-lg">
                <Image
                  alt="main-image"
                  src={imageSrc[0]}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
              </div>
            )}

            {/* Two Smaller Images */}
            {imageSrc.slice(1, 3).map((src, index) => (
              <div
                key={index}
                className={`relative h-[24vh] overflow-hidden rounded-lg ${index === 0 ? 'col-span-1' : 'col-span-1'}`}
              >
                <Image
                  alt={`image-${index + 1}`}
                  src={src}
                  fill
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={handleImageClick}
                />
              </div>
            ))}

            {/* Show All Photos Button */}
            {imageSrc.length > 3 && (
              <div className="absolute bottom-5 right-5">
                <button
                  className="bg-white text-black font-semibold p-2 rounded-md shadow-md cursor-pointer"
                  onClick={handleImageClick}
                >
                  Show all photos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListingHead;

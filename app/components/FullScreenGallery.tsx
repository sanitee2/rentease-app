'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';

interface FullScreenGalleryProps {
  images: string[];
  onClose: () => void; // Add onClose prop to control visibility from the parent
}

const FullScreenGallery: React.FC<FullScreenGalleryProps> = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
      {/* Close Button */}
      <button
        className="absolute top-5 left-5 p-2 text-white hover:text-gray-300 z-10"
        onClick={onClose}
      >
        <AiOutlineClose size={32} />
      </button>

      {/* Main Image Container */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        {/* Previous Button */}
        <button
          className="absolute left-10 p-2 text-white hover:text-gray-300 z-10"
          onClick={handlePrev}
        >
          <MdArrowBackIos size={32} />
        </button>

        {/* Current Image */}
        <div className="relative w-[80vw] h-[70vh]">
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            fill
            className="object-contain"
          />

          {/* Image Counter */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-md">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Next Button */}
        <button
          className="absolute right-10 p-2 text-white hover:text-gray-300 z-10"
          onClick={handleNext}
        >
          <MdArrowForwardIos size={32} />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="w-full h-24 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="flex gap-2 px-4 overflow-x-auto max-w-[90vw] py-2">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                relative 
                h-20 
                w-20 
                flex-shrink-0 
                cursor-pointer 
                transition-all 
                duration-200
                ${index === currentIndex 
                  ? 'border-2 border-white opacity-100' 
                  : 'border border-gray-600 opacity-60 hover:opacity-100'
                }
                rounded-md 
                overflow-hidden
              `}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullScreenGallery;

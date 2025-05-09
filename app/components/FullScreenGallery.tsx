'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface FullScreenGalleryProps {
  images: string[];
  onClose: () => void;
  initialIndex: number;
}

const FullScreenGallery: React.FC<FullScreenGalleryProps> = ({ 
  images, 
  onClose,
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const hasMultipleImages = images.length > 1;

  // Handle mouse down event to start dragging
  const handleMouseDown = (e: MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle mouse move event while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && scale > 1) {
      const maxOffset = (scale - 1) * 500; // Increased from 200 to 500 for more movement range
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain movement within bounds
      const boundedX = Math.max(Math.min(newX, maxOffset), -maxOffset);
      const boundedY = Math.max(Math.min(newY, maxOffset), -maxOffset);

      setPosition({
        x: boundedX,
        y: boundedY
      });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset position when zoom changes
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
    setPosition({ x: 0, y: 0 }); // Reset position on zoom change
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
    setPosition({ x: 0, y: 0 }); // Reset position on zoom change
  };

  const handlePrev = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 }); // Reset position on image change
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 }); // Reset position on image change
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-[60] overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 w-full px-5 py-4 flex justify-between items-center z-[70] bg-black bg-opacity-50">
        <button
          className="p-2 text-white hover:text-gray-300 rounded-full hover:bg-black/20"
          onClick={onClose}
        >
          <AiOutlineClose size={24} />
        </button>
        
        {/* Zoom Controls */}
        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:bg-black/20"
            onClick={handleZoomOut}
            disabled={scale === 1}
          >
            <ZoomOut size={20} />
          </button>
          <button
            type="button"
            className="p-2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:bg-black/20"
            onClick={handleZoomIn}
            disabled={scale === 3}
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-[calc(100vh-96px)] flex items-center justify-center">
        {/* Previous Button */}
        {hasMultipleImages && (
          <button
            className="absolute left-4 p-2 text-white hover:text-gray-300 z-[70] rounded-full hover:bg-black/20"
            onClick={handlePrev}
          >
            <MdArrowBackIos size={24} />
          </button>
        )}

        {/* Current Image */}
        <div 
          className="relative w-full h-full overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="relative w-full h-full transition-transform duration-200 ease-out"
            style={{ 
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              willChange: 'transform'
            }}
          >
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain p-4"
              quality={100}
              priority
              draggable={false}
            />
          </div>

          {/* Image Counter - Only show if multiple images */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded-full text-sm z-[70]">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom Level Indicator */}
          {scale > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded-full text-sm z-[70]">
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>

        {/* Next Button */}
        {hasMultipleImages && (
          <button
            className="absolute right-4 p-2 text-white hover:text-gray-300 z-[70] rounded-full hover:bg-black/20"
            onClick={handleNext}
          >
            <MdArrowForwardIos size={24} />
          </button>
        )}
      </div>

      {/* Thumbnail Strip - Only show if multiple images */}
      {hasMultipleImages && (
        <div className="w-full h-24 bg-black/50 flex items-center justify-center">
          <div className="flex gap-2 px-4 overflow-x-auto max-w-[90vw] py-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => {
                  setScale(1);
                  setCurrentIndex(index);
                }}
                className={`
                  relative 
                  h-16 
                  w-16 
                  flex-shrink-0 
                  cursor-pointer 
                  transition-all 
                  duration-200
                  ${index === currentIndex 
                    ? 'ring-2 ring-white opacity-100' 
                    : 'ring-1 ring-gray-600 opacity-60 hover:opacity-100'
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
      )}
    </div>
  );
};

export default FullScreenGallery;

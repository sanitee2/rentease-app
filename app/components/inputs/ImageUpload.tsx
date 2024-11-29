'use client';

import React, { useEffect, useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { TbPhotoPlus } from 'react-icons/tb';
import { AiFillCloseCircle } from 'react-icons/ai';

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
  maxImages?: number;
}

const ImageUpload = React.forwardRef<HTMLDivElement, ImageUploadProps>(({
  onChange,
  value = [],
  maxImages = 5
}, ref) => {
  // Use a ref to store temporary images
  const imagesRef = useRef<string[]>(value);

  useEffect(() => {
    imagesRef.current = value;
  }, [value]);

  const handleUpload = React.useCallback((result: any) => {
    if (!result?.info?.secure_url) return;
    
    const newUrl = result.info.secure_url;
    const currentImages = imagesRef.current;
    
    // Only update if we haven't reached the max
    if (currentImages.length < maxImages) {
      const updatedImages = [...currentImages, newUrl];
      imagesRef.current = updatedImages;
      onChange(updatedImages);
    }
  }, [onChange, maxImages]);

  const handleRemoveImage = React.useCallback((imageToRemove: string) => {
    const updatedImages = imagesRef.current.filter(img => img !== imageToRemove);
    imagesRef.current = updatedImages;
    onChange(updatedImages);
  }, [onChange]);

  const remainingSlots = maxImages - value.length;
  const canUpload = remainingSlots > 0;

  return (
    <div ref={ref} className="space-y-4">
      {canUpload && (
        <CldUploadWidget
          onSuccess={handleUpload}
          uploadPreset="rfsxfegg"
          options={{
            maxFiles: maxImages,
            sources: ['local', 'url', 'camera'],
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open?.()}
              className="w-full"
            >
              <div className="
                relative 
                cursor-pointer 
                hover:opacity-70 
                transition 
                border-dashed 
                border-2 
                p-20 
                border-neutral-300 
                flex 
                flex-col 
                justify-center 
                items-center 
                gap-4 
                text-neutral-600
              ">
                <TbPhotoPlus size={50} />
                <div className="font-semibold text-lg">
                  Click to upload
                </div>
                <div className="text-sm text-neutral-500">
                  {value.length} of {maxImages} images uploaded
                </div>
                {canUpload && (
                  <div className="text-sm text-neutral-500">
                    You can upload {remainingSlots} more {remainingSlots === 1 ? 'image' : 'images'}
                  </div>
                )}
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}

      {value?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {Array.isArray(value) && value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square rounded-md overflow-hidden group"
            >
              <Image
                fill
                style={{ objectFit: 'cover' }}
                src={url}
                alt={`Upload ${index + 1}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
                className="
                  absolute 
                  top-2 
                  right-2 
                  p-1 
                  rounded-full 
                  bg-white/80 
                  hover:bg-white 
                  transition
                  opacity-0
                  group-hover:opacity-100
                "
              >
                <AiFillCloseCircle className="text-red-500" size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!canUpload && (
        <p className="text-sm text-red-500">
          Maximum of {maxImages} images reached
        </p>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default React.memo(ImageUpload);

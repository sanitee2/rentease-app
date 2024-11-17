'use client';

import React, { useEffect, useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import { AiFillCloseCircle } from 'react-icons/ai';

interface ProfileImageUploadProps {
  onChange: (value: string) => void;
  value?: string | null;
}

const ProfileImageUpload = React.forwardRef<HTMLDivElement, ProfileImageUploadProps>(({
  onChange,
  value = null
}, ref) => {
  const handleUpload = React.useCallback((result: any) => {
    if (!result?.info?.secure_url) return;
    onChange(result.info.secure_url);
  }, [onChange]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden relative border border-indigo-100 shadow-sm bg-white ring-2 ring-indigo-50">
          {value ? (
            <Image
              fill
              style={{ objectFit: 'cover' }}
              src={value}
              alt="Profile"
              sizes="128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-50 to-indigo-100/50">
              <FaUser size={40} className="text-indigo-300" />
            </div>
          )}
        </div>
        
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white shadow-md hover:bg-indigo-50 transition border border-indigo-100"
          >
            <AiFillCloseCircle className="text-indigo-500" size={20} />
          </button>
        )}
      </div>

      <CldUploadWidget
        onSuccess={handleUpload}
        uploadPreset="rfsxfegg"
        options={{
          maxFiles: 1,
          sources: ['local', 'url', 'camera'],
          resourceType: 'image',
          cropping: true,
          croppingAspectRatio: 1,
          croppingShowDimensions: true,
          croppingValidateDimensions: true,
          maxImageWidth: 800,
          maxImageHeight: 800,
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open?.()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition text-sm font-medium shadow-sm hover:shadow-md"
          >
            {value ? 'Change Photo' : 'Upload Photo'}
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
});

ProfileImageUpload.displayName = 'ProfileImageUpload';

export default React.memo(ProfileImageUpload); 
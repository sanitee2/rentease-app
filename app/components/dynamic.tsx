'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Maps
export const DynamicGoogleMap = dynamic(
  () => import('./GoogleMapComponent'),
  {
    loading: () => <div className="animate-pulse h-[400px] bg-gray-100 rounded-lg" />,
    ssr: false
  }
);

// Modals and Heavy UI Components
export const DynamicFullScreenGallery = dynamic(
  () => import('./FullScreenGallery'),
  {
    loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />,
    ssr: false
  }
); 
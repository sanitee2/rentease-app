'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, StreetViewPanorama } from '@react-google-maps/api';

interface GoogleMapComponentProps {
  lat: number;
  lng: number;
}

const containerStyle = {
  width: '100%',
  height: '400px', // Set height as needed
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ lat, lng }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'], // Add any necessary libraries here
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const center = useMemo(() => ({ 
    lat, 
    lng 
  }), [lat, lng]);

  // Function to initialize the map and marker
  const onLoad = (mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;

    if (mapInstance && !markerRef.current) {
      const image = {
        url: '/images/marker.png',  // Updated path
        scaledSize: new window.google.maps.Size(40, 60),
        anchor: new window.google.maps.Point(20, 40),
      };

      markerRef.current = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        icon: image,
        title: 'Location'
      });
    }
  };

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const image = {
        url: '/images/marker.png',  // Updated path
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };

      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: center,
          map: mapRef.current,
          icon: image,
          title: 'Location'
        });
      } else {
        markerRef.current.setPosition(center);
      }
    }
  }, [isLoaded, lat, lng, center]);

  return isLoaded ? (
    <div className="flex flex-row gap-4">
      {/* Map View */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={20}
        onLoad={onLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          fullscreenControl: false,
          mapTypeId: 'hybrid',
        }}
      />

      {/* Street View */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <StreetViewPanorama
          options={{
            position: center,
            visible: true,
            pov: { heading: 100, pitch: 0 },
            zoom: 1,
            disableDefaultUI: true,
            disableDoubleClickZoom: true,
            clickToGo: false,
            showRoadLabels: false,
            enableCloseButton: false,
          }}
        />
      </GoogleMap>
    </div>
  ) : (
    <div className="flex items-center justify-center h-[400px] bg-gray-100">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  );
};

export default GoogleMapComponent;

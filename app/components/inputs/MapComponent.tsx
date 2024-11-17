'use client';
import React, { useCallback, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import toast from 'react-hot-toast';

// Styles for the map container
const containerStyle = {
  width: '100%',
  height: '400px',
};

// Surigao City center coordinates
const center = {
  lat: 9.787091, 
  lng: 125.495945, 
};

const surigaoCityBounds = {
  north: 9.8150,
  south: 9.7590,
  east: 125.5280,
  west: 125.4620,
};

interface MapComponentProps {
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationChange }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; 

  // Load the Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey || '', 
  });

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const isLocationWithinBounds = (lat: number, lng: number) => {
    const bounds = new google.maps.LatLngBounds(
      { lat: surigaoCityBounds.south, lng: surigaoCityBounds.west },
      { lat: surigaoCityBounds.north, lng: surigaoCityBounds.east }
    );
    return bounds.contains({ lat, lng });
  };

  // Handle map click event to place a marker and call onLocationChange callback
  const onMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();
      if (lat && lng && isLocationWithinBounds(lat, lng)) {
        setSelectedLocation({ lat, lng });
        if (onLocationChange) {
          onLocationChange({ lat, lng });
        }
      } else {
        toast.error('Location out of bounds. Please select a location within Surigao City.');
      }
    },
    [onLocationChange]
  );

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14} // Zoom level to focus on Surigao City
      mapTypeId="hybrid" // Default map type to satellite
      options={{
        zoomControl: true, // Only zoom control enabled
        mapTypeControl: false, // Disable map type control (to prevent switching between map types)
        streetViewControl: false, // Disable street view control
        fullscreenControl: false, // Disable fullscreen control
        restriction: {
          latLngBounds: surigaoCityBounds, // Restrict map movement to Surigao City bounds
          strictBounds: false,
        },
      }}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      onClick={onMapClick} // Capture click event
    >
      {/* Marker will appear wherever the user clicks within the allowed bounds */}
      {selectedLocation && (
        <Marker position={selectedLocation} />
      )}
    </GoogleMap>
  );
};

export default MapComponent;

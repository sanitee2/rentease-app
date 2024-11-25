'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { StandaloneSearchBox, GoogleMap, Circle, useLoadScript } from '@react-google-maps/api';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_OPTIONS } from '@/lib/constants/google-maps';

interface LocationFilterProps {
  onLocationChange: (location: { lat: number; lng: number; radius: number } | null) => void;
  isReset?: boolean;
}

// Add these styles for the Google Places Autocomplete dropdown
const googlePlacesStyles = `
  .pac-container {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    margin-top: 4px;
    font-family: inherit;
    padding: 8px 0;
  }

  .pac-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1.5;
    border: none;
  }

  .pac-item:hover {
    background-color: #f3f4f6;
  }

  .pac-item-query {
    font-size: 14px;
    color: #111827;
  }

  .pac-matched {
    font-weight: 500;
  }

  .pac-icon {
    display: none;
  }
`;

const LocationFilter: React.FC<LocationFilterProps> = ({ 
  onLocationChange,
  isReset 
}) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [placeDetails, setPlaceDetails] = useState<{
    name?: string;
    address?: string;
  } | null>(null);
  const [radius, setRadius] = useState<number>(1);
  const [mapKey, setMapKey] = useState<number>(0);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [searchBoxOptions, setSearchBoxOptions] = useState<any>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  // Initialize searchBoxOptions after Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      const { north, south, east, west } = GOOGLE_MAPS_OPTIONS.bounds;
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(south, west), // SW corner
        new window.google.maps.LatLng(north, east)  // NE corner
      );

      setSearchBoxOptions({
        ...GOOGLE_MAPS_OPTIONS,
        bounds,
      });
    }
  }, [isLoaded]);

  const handleClearLocation = useCallback(() => {
    setLocation(null);
    setSearchValue('');
    setPlaceDetails(null);
    setRadius(1);
    setMapKey(prev => prev + 1);
    onLocationChange(null);
  }, [onLocationChange]);

  useEffect(() => {
    if (isReset) {
      handleClearLocation();
    }
  }, [isReset, handleClearLocation]);

  const radiusOptions = [
    { value: 0.1, label: '100 meters' },
    { value: 0.2, label: '200 meters' },
    { value: 0.5, label: '500 meters' },
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 20, label: '20 km' },
  ];

  const handlePlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry?.location;
      
      if (location) {
        const lat = location.lat();
        const lng = location.lng();
        setLocation({ lat, lng });
        
        const details = {
          name: place.name,
          address: place.formatted_address
        };
        setPlaceDetails(details);
        setSearchValue(`${details.name}${details.address ? ` - ${details.address}` : ''}`);
        setMapKey(prev => prev + 1);
        onLocationChange({ lat, lng, radius });
      }
    }
  }, [radius, onLocationChange]);

  const handleRadiusChange = useCallback((value: string) => {
    const newRadius = Number(value);
    setRadius(newRadius);
    setMapKey(prev => prev + 1);
    if (location) {
      onLocationChange({ ...location, radius: newRadius });
    }
  }, [location, onLocationChange]);

  const getZoomLevel = (radius: number) => {
    if (radius <= 0.2) return 16;
    if (radius <= 0.5) return 15;
    if (radius <= 1) return 14;
    if (radius <= 2) return 13;
    if (radius <= 5) return 12;
    if (radius <= 10) return 11;
    return 10;
  };

  // Add style injection effect
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = googlePlacesStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (!isLoaded || !searchBoxOptions) {
    return <div className="h-[300px] w-full flex items-center justify-center bg-neutral-100 rounded-lg">
      Loading Maps...
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className='space-y-2'>
        <Label className="text-sm font-medium text-neutral-700 mb-1.5 ">
          Search location
        </Label>
        <StandaloneSearchBox
          onLoad={ref => searchBoxRef.current = ref}
          onPlacesChanged={handlePlacesChanged}
          options={searchBoxOptions}
        >
          <Input
            placeholder="Enter a location in Surigao City..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="  focus-visible:ring-indigo-600"
          />
        </StandaloneSearchBox>
      </div>

      {/* Radius Selector */}
      <div className="space-y-2">
        <Label>Search Radius</Label>
        <Select
          value={radius.toString()}
          onValueChange={handleRadiusChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select radius" />
          </SelectTrigger>
          <SelectContent>
            {radiusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Map Display */}
      {location && (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-neutral-200">
          <GoogleMap
            key={mapKey}
            zoom={getZoomLevel(radius)}
            center={location}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              scrollwheel: false,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            <Circle
              center={location}
              radius={radius * 1000}
              options={{
                fillColor: '#4F46E5',
                fillOpacity: 0.1,
                strokeColor: '#4F46E5',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default LocationFilter; 
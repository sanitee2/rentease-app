import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

interface LocationSelectorProps {
  location: { lat: number; lng: number };
  onStreetChange: (street: string) => void;
  onBarangayChange: (barangay: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ location, onStreetChange, onBarangayChange }) => {
  const [streets, setStreets] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);
  const [selectedStreet, setSelectedStreet] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  // Reverse geocode to get address components from Google Maps API
  useEffect(() => {
    const fetchAddressComponents = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        const addressComponents = response.data.results[0].address_components;

        const foundStreets: string[] = [];
        const foundBarangays: string[] = [];

        addressComponents.forEach((component: any) => {
          if (component.types.includes('route')) {
            foundStreets.push(component.long_name);
          }
          if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
            foundBarangays.push(component.long_name);
          }
        });

        setStreets(foundStreets);
        setBarangays(foundBarangays);
      } catch (error) {
        console.error('Error fetching address components:', error);
      }
    };

    fetchAddressComponents();
  }, [location]);

  const handleStreetChange = (selectedOption: any) => {
    setSelectedStreet(selectedOption.value);
    onStreetChange(selectedOption.value);
  };

  const handleBarangayChange = (selectedOption: any) => {
    setSelectedBarangay(selectedOption.value);
    onBarangayChange(selectedOption.value);
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Street</label>
        <Select
          options={streets.map((street) => ({ value: street, label: street }))}
          value={selectedStreet ? { value: selectedStreet, label: selectedStreet } : null}
          onChange={handleStreetChange}
          placeholder="Select a street"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Barangay</label>
        <Select
          options={barangays.map((barangay) => ({ value: barangay, label: barangay }))}
          value={selectedBarangay ? { value: selectedBarangay, label: selectedBarangay } : null}
          onChange={handleBarangayChange}
          placeholder="Select a barangay"
        />
      </div>
    </div>
  );
};

export default LocationSelector;

import React from 'react';
import Select from 'react-select';
import Selector from './Selector';

interface BarangaySelectorProps {
  barangays: string[]; // Array of available barangay names
  onBarangayChange: (barangay: string) => void;
}

const BarangaySelector: React.FC<BarangaySelectorProps> = ({ barangays, onBarangayChange }) => {
  const handleBarangayChange = (selectedOption: any) => {
    onBarangayChange(selectedOption.value);
  };

  return (
    <div className="mb-4">
      <Selector array={barangays} onChange={onBarangayChange} placeholder='Select your Barangay'/>
    </div>
  );
};

export default BarangaySelector;

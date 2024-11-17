import React from 'react';
import Select from 'react-select';
import Selector from './Selector';

interface StreetSelectorProps {
  streets: string[]; // Array of available street names
  onStreetChange: (street: string) => void;
}

const StreetSelector: React.FC<StreetSelectorProps> = ({ streets, onStreetChange }) => {
  const handleStreetChange = (selectedOption: any) => {
    if (selectedOption) {
      onStreetChange(selectedOption.value);
    } else {
      onStreetChange(''); // Or pass `null` or handle as you prefer when no option is selected
    }
  };

  return (
    <div >
      <Selector array={streets} onChange={handleStreetChange} placeholder='Select your street'/>
    </div>
  );
};

export default StreetSelector;

import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface SelectorProps {
  array: string[];
  onChange: (value: string) => void;
  placeholder: string;
}

const Selector: React.FC<SelectorProps> = ({ array, onChange, placeholder }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Mark that it's now client-side
  }, []);

  const handleSelectionChange = (selectedOption: any) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    } else {
      onChange(''); // Handle the case when no option is selected
    }
  };

  if (!isClient) {
    return null; // Prevent SSR rendering
  }

  return (
    <Select
      placeholder={placeholder}
      isClearable
      options={array.map((value) => ({ value: value, label: value }))}
      onChange={handleSelectionChange}
      formatOptionLabel={(option: any) => (
        <div className="flex flex-row items-center gap-3">
          <div>
            {option.label}
            <span className="ml-1 text-neutral-500">{option.region}</span>
          </div>
        </div>
      )}
      classNames={{
        control: () => 'p-1 border-2',
        input: () => 'text-md',
        option: () => 'text-lg',
      }}
      theme={(theme) => ({
        ...theme,
      })}
    />
  );
};

export default Selector;

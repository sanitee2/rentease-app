'use client';

import { useState, useEffect, useRef } from 'react';
import { IoTimeOutline } from 'react-icons/io5';

interface TimeSelectProps {
  value: string;
  onChange: (time: string) => void;
}

const TimeSelect: React.FC<TimeSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate time slots from 9 AM to 5 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
      display: `${displayHour}:${minute} ${period}`,
      value: `${hour.toString().padStart(2, '0')}:${minute}`
    };
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer flex items-center justify-between hover:border-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">{formatDisplayTime(value)}</span>
        <IoTimeOutline className="text-gray-400 w-5 h-5" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
          <div className="py-1">
            {timeSlots.map((slot) => (
              <div
                key={slot.value}
                className={`px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 ${
                  value === slot.value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(slot.value);
                  setIsOpen(false);
                }}
              >
                {slot.display}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelect; 
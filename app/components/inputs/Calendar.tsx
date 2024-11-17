'use client';

import React, { useEffect, useState } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

interface CalendarProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  // Helper function to get the number of days in the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

    const daysArray: number[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(0); // Empty slots before the first day of the month
    }
    for (let i = 1; i <= lastDateOfMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };

  // Check if the given day is in the past
  const isDateInPast = (day: number) => {
    const today = new Date();
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return selected.getTime() < today.setHours(0, 0, 0, 0);
  };

  // Handle selecting a date
  const handleDateClick = (day: number) => {
    if (isDateInPast(day)) return; // Don't allow selecting past dates

    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange(selected);
  };

  // Navigate to previous or next month
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newMonth = direction === 'prev' ? prev.getMonth() - 1 : prev.getMonth() + 1;
      return new Date(prev.getFullYear(), newMonth, 1);
    });
  };

  // Update the days in the month when the currentDate changes
  useEffect(() => {
    setDaysInMonth(getDaysInMonth(currentDate));
  }, [currentDate]);

  return (
    <div className="bg-white rounded-lg border">
      {/* Header with month/year and navigation */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <button 
          onClick={() => handleMonthChange('prev')}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <AiOutlineLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-base font-medium text-gray-900">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>
        
        <button 
          onClick={() => handleMonthChange('next')}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <AiOutlineRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-xs text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const isPast = isDateInPast(day);
            const isSelected =
              selectedDate &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentDate.getMonth() &&
              selectedDate.getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={index}
                onClick={() => day !== 0 && !isPast && handleDateClick(day)}
                className={`
                  relative text-center py-2
                  ${day !== 0 ? 'cursor-pointer' : ''}
                  ${isSelected ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-900'}
                `}
              >
                {day !== 0 && (
                  <>
                    <div
                      className={`
                        absolute inset-0 m-1 rounded-full
                        ${isSelected ? 'bg-indigo-600' : 'hover:bg-gray-100'}
                        ${isPast ? 'cursor-not-allowed' : ''}
                      `}
                    />
                    <span className="relative z-10 text-sm">
                      {day}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

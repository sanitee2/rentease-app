'use client';

import React, { useState } from 'react';

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));

const Clock: React.FC = () => {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const [isSelectingMinutes, setIsSelectingMinutes] = useState(false);

  // Handle hour and minute selection
  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    setIsSelectingMinutes(true); // Switch to minute selection after selecting an hour
  };

  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute);
    setIsSelectingMinutes(false); // Switch back after selecting minutes
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Select Time
      </h2>

      <div className="relative w-64 h-64 mx-auto flex items-center justify-center rounded-full border-2 border-gray-300">
        <div className="absolute flex items-center justify-center w-64 h-64 rounded-full">
          <div className="w-1 h-16 bg-blue-500 origin-bottom transform rotate-[var(--rotate)]" />
        </div>
        {isSelectingMinutes
          ? minutes.map((minute, index) => (
              <div
                key={index}
                className="absolute flex justify-center items-center w-full h-full"
                style={{
                  transform: `rotate(${index * 6}deg)`,
                }}
                onClick={() => handleMinuteClick(parseInt(minute))}
              >
                <div
                  className="absolute w-8 h-8 flex justify-center items-center transform rotate-[-${index * 6}deg]"
                  style={{
                    top: '-2.5rem',
                  }}
                >
                  {minute}
                </div>
              </div>
            ))
          : hours.map((hour, index) => (
              <div
                key={index}
                className="absolute flex justify-center items-center w-full h-full"
                style={{
                  transform: `rotate(${index * 30}deg)`,
                }}
                onClick={() => handleHourClick(parseInt(hour))}
              >
                <div
                  className="absolute w-8 h-8 flex justify-center items-center transform rotate-[-${index * 30}deg]"
                  style={{
                    top: '-2.5rem',
                  }}
                >
                  {hour}
                </div>
              </div>
            ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg font-medium">
          Selected Time: {selectedHour}:{selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
        </p>
        <button
          className="mt-4 text-blue-500 underline"
          onClick={() => setIsSelectingMinutes(false)}
        >
          Select Hour
        </button>
        <button
          className="ml-4 text-blue-500 underline"
          onClick={() => setIsSelectingMinutes(true)}
        >
          Select Minute
        </button>
      </div>
    </div>
  );
};

export default Clock;

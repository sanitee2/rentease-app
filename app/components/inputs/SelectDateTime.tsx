'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Calendar from './Calendar';
import { SafeRoom, SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import toast from 'react-hot-toast';
import Select from 'react-select';
import TimeSelect from './TimeSelect';

interface SelectDateTimeProps {
  rooms: SafeRoom[];
  currentUser: SafeUser | null | undefined;
  listingId: string;
  selectedRoom: { value: string, label: string } | null;
  onRoomChange: (value: { value: string, label: string } | null) => void;
}

const SelectDateTime: React.FC<SelectDateTimeProps> = ({ rooms, currentUser, listingId, selectedRoom, onRoomChange }) => {
  const loginModal = useLoginModal();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [error, setError] = useState<string>('');

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  // Handle room selection
  const handleRoomChange = (selectedOption: any) => {
    onRoomChange(selectedOption);
  };

  // Combine the selected date and time in local time
  const getCombinedDateTime = () => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(':');
      const combinedDateTime = new Date(selectedDate);
      
      // Set the hours and minutes for the selected time in local time
      combinedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      return combinedDateTime;
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(''); // Reset error state

    // Validation
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }

    if (!selectedDate) {
      setError('Please select a date.');
      return;
    }

    if (!selectedRoom) {
      setError('Please select a room.');
      return;
    }

    const combinedDateTime = getCombinedDateTime();

    if (!combinedDateTime) {
      setError('Please select a valid date and time.');
      return;
    }

    try {
      // Check if the user has requested more than 2 viewings for this listing
      const response = await axios.get('/api/request-viewing/count', {
        params: { userId: currentUser.id, listingId },
      });

      const viewingCount = response.data.count;

      if (viewingCount >= 2) {
        setError('You have already requested the maximum number of viewings allowed for this listing.');
        return;
      }

      // Proceed if there are no errors
      // Format date and time properly
      const date = combinedDateTime.toISOString().split('T')[0]; // Extract date part
      const time = combinedDateTime.toISOString(); // Use full ISO string for time with timezone

      await axios.post('/api/request-viewing', {
        date,
        time,
        roomId: selectedRoom,
        userId: currentUser.id,
        listingId: listingId, // Include listingId
      });

      toast.success('Request submitted successfully');
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Error submitting request. Please try again later.');
    }
  };

  // Convert rooms data to options for React Select
  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: room.title,
  }));

  return (
    <div id="booking-section" className="sticky top-28 w-full">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Schedule a Viewing
        </h2>

        <div className="space-y-6">
          {/* Room Selection - Improved styling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <Select
              id="roomSelect"
              value={selectedRoom}
              onChange={handleRoomChange}
              options={roomOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Choose a room"
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#E5E7EB',
                  '&:hover': {
                    borderColor: '#A5B4FC'
                  }
                })
              }}
            />
          </div>

          {/* Time Selection - Better UI */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Preferred Time
            </label>
            <TimeSelect
              value={selectedTime}
              onChange={handleTimeChange}
            />
          </div>

          {/* Calendar - Enhanced presentation */}
          <div className="">
            <label className="block text-sm text-gray-600 mb-2">
              Preferred Date
            </label>
            <Calendar 
              selectedDate={selectedDate} 
              onChange={handleDateChange}
            />
          </div>

          

          {/* Error Message - Improved visibility */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Submit Button - Enhanced styling */}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedDate || !selectedRoom}
          >
            Request Viewing
          </button>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You can schedule up to 2 viewings per listing
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectDateTime;

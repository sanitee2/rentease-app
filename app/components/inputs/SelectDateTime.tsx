'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from './Calendar';
import { SafeRoom, SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import toast from 'react-hot-toast';
import Select from 'react-select';
import TimeSelect from './TimeSelect';
import { AlertCircle } from 'lucide-react';

interface SelectDateTimeProps {
  rooms: SafeRoom[];
  currentUser: SafeUser | null | undefined;
  listingId: string;
  selectedRoom: { value: string, label: string } | null;
  onRoomChange: (value: { value: string, label: string } | null) => void;
  pricingType: 'ROOM_BASED' | 'LISTING_BASED';
}

const SelectDateTime: React.FC<SelectDateTimeProps> = ({ rooms, currentUser, listingId, selectedRoom, onRoomChange, pricingType }) => {
  const loginModal = useLoginModal();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [error, setError] = useState<string>('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for pending requests on component mount
  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!currentUser) return;
      
      try {
        const response = await axios.get('/api/request-viewing/pending', {
          params: { 
            userId: currentUser.id, 
            listingId 
          }
        });
        setHasPendingRequest(response.data.hasPendingRequest);
      } catch (error) {
        console.error('Error checking pending requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPendingRequest();
  }, [currentUser, listingId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Viewing Request
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You already have a pending viewing request for this property. 
              Please wait for the landlord to respond to your request.
            </p>
          </div>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg w-full">
            <p className="text-sm text-gray-500">
              Once your request is approved or declined, you can schedule another viewing if needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

    // Only validate room selection for room-based pricing
    if (pricingType === 'ROOM_BASED' && !selectedRoom) {
      setError('Please select a room.');
      return;
    }

    const combinedDateTime = getCombinedDateTime();

    if (!combinedDateTime) {
      setError('Please select a valid date and time.');
      return;
    }

    try {
      // Check for pending requests first
      const pendingResponse = await axios.get('/api/request-viewing/pending', {
        params: { 
          userId: currentUser.id, 
          listingId 
        },
      });

      if (pendingResponse.data.hasPendingRequest) {
        setError('You already have a pending viewing request for this property. Please wait for the landlord to respond.');
        return;
      }

      // Check total viewing count
      const countResponse = await axios.get('/api/request-viewing/count', {
        params: { userId: currentUser.id, listingId },
      });

      const viewingCount = countResponse.data.count;

      if (viewingCount >= 2) {
        setError('You have already requested the maximum number of viewings allowed for this listing.');
        return;
      }

      // Different endpoint based on pricing type
      const endpoint = pricingType === 'ROOM_BASED' 
        ? '/api/request-viewing/room'
        : '/api/request-viewing/listing';

      // Create request data
      const requestData = {
        userId: currentUser.id,
        listingId: listingId,
        preferredDate: combinedDateTime?.toISOString(),
        // Only include roomId for room-based pricing
        ...(pricingType === 'ROOM_BASED' && selectedRoom ? { roomId: selectedRoom.value } : {})
      };

      await axios.post(endpoint, requestData);

      toast.success('Viewing request submitted successfully');
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime('12:00');
      if (pricingType === 'ROOM_BASED') {
        onRoomChange(null);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit viewing request');
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
          {/* Only show room selection for room-based pricing */}
          {pricingType === 'ROOM_BASED' && (
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
          )}

          {/* Time Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Preferred Time
            </label>
            <TimeSelect
              value={selectedTime}
              onChange={handleTimeChange}
            />
          </div>

          {/* Calendar */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Preferred Date
            </label>
            <Calendar 
              selectedDate={selectedDate} 
              onChange={handleDateChange}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedDate || (pricingType === 'ROOM_BASED' && !selectedRoom)}
          >
            Request Viewing
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can schedule up to 2 viewings per listing
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectDateTime;

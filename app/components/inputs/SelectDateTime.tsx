'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Calendar from './Calendar';
import { SafeRoom, SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import toast from 'react-hot-toast';
import Select from 'react-select';
import TimeSelect from './TimeSelect';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SelectDateTimeProps {
  rooms: SafeRoom[];
  currentUser: SafeUser | null | undefined;
  listingId: string;
  selectedRoom: { value: string, label: string } | null;
  onRoomChange: (value: { value: string, label: string } | null) => void;
  pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  maxTenantCount?: number;
  hasMaxTenantCount?: boolean;
  currentTenants?: string[];
  listing: {
    id: string;
    leaseContracts?: {
      id: string;
      status: string;
    }[];
  };
}

const SelectDateTime: React.FC<SelectDateTimeProps> = ({ 
  rooms, 
  currentUser, 
  listingId, 
  selectedRoom, 
  onRoomChange, 
  pricingType,
  maxTenantCount = 0,
  hasMaxTenantCount,
  currentTenants = [],
  listing
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [error, setError] = useState<string>('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Only check for pending requests if user is logged in
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
      }
    };

    checkPendingRequest();
  }, [currentUser, listingId]);

  // Show pending request message if user has a pending request
  if (currentUser && hasPendingRequest) {
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

    // Check for login first
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }

    // Rest of your validation and submission logic
    if (!selectedDate) {
      setError('Please select a date.');
      return;
    }

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

  // Check if listing is fully occupied
  const isListingFull = useMemo(() => {
    if (pricingType === 'LISTING_BASED') {
      // Check if there's any active lease contract
      return listing.leaseContracts?.some(
        lease => lease.status === 'ACTIVE'
      ) || false;
    } else {
      // For room-based, check if all rooms are occupied
      return rooms.every(room => 
        room.maxTenantCount && room.tenants?.length >= room.maxTenantCount
      );
    }
  }, [pricingType, listing, rooms]);

  // Filter available rooms
  const availableRooms = useMemo(() => {
    return rooms.filter(room => {
      // Check if room has maxTenantCount and tenants array
      if (room.maxTenantCount) {
        const roomTenants = room.tenants?.length || 0;
        return roomTenants < room.maxTenantCount;
      }
      return true;
    });
  }, [rooms]);

  // Convert only available rooms to options with occupancy info
  const roomOptions = availableRooms.map((room) => ({
    value: room.id,
    label: `${room.title} (${room.tenants?.length || 0}/${room.maxTenantCount || '∞'} occupied)`,
  }));

  // If listing is full or no rooms available, show message
  if (isListingFull || (pricingType === 'ROOM_BASED' && availableRooms.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isListingFull ? 'Property Fully Occupied' : 'No Rooms Available'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isListingFull 
                ? 'This property has reached its maximum occupancy. Please check back later or explore other properties.'
                : 'All rooms in this property are currently occupied. Please check back later or explore other properties.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/listings')}
            className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Browse Other Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="booking-section" className="sticky top-28 w-full">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Schedule a Viewing
        </h2>

        <div className="space-y-6">
          {/* Only show room selection for room-based pricing if rooms are available */}
          {pricingType === 'ROOM_BASED' && availableRooms.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Available Room
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
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium 
              hover:bg-indigo-700 transition-colors duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed"
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

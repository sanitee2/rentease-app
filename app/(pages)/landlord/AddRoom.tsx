import React, { useState, useEffect } from 'react';
import RoomDetailsDrawer from './RoomDetailsDrawer';
import { BsDoorOpenFill } from 'react-icons/bs';
import { MdModeEdit } from 'react-icons/md';
import { AiFillDelete } from 'react-icons/ai'; // Import Delete Icon
import Image from 'next/image';
import Heading from '@/app/components/Heading';
import Modal from '@/app/components/Modals/Modal';
import toast from "react-hot-toast";

interface Room {
  title: string;
  description: string;
  roomCategory: string;
  price: number | null;
  images: string[];
  amenities: {
    [key: string]: {
      selected: boolean;
      note: string;
    };
  };
  maxTenantCount: number;
}

interface AddRoomProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  listingCategory: {
    pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  } | null;
}

const AddRoom: React.FC<AddRoomProps> = ({ rooms, setRooms, listingCategory }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Track cancel modal visibility
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Track delete modal visibility
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null); // Room to delete
  const [isEdited, setIsEdited] = useState(false); // Track if the room has unsaved changes

  // Update the empty room constant
  const EMPTY_ROOM: Room = {
    title: '',
    description: '',
    roomCategory: '',
    price: listingCategory?.pricingType === 'ROOM_BASED' ? 0 : null,
    images: [],
    amenities: {},
    maxTenantCount: 1,
  };

  // Handle adding a new room
  const handleAddRoom = () => {
    if (rooms.length >= 10) {
      toast.error('Maximum of 10 rooms can be added');
      return;
    }
    setSelectedRoom(null);
    setIsEdited(false);
    setIsDrawerOpen(true);
  };

  // Handle editing an existing room
  const handleEditRoom = (room: Room) => {
    // Create a deep copy of the room to ensure proper state update
    const roomCopy = {
      ...room,
      amenities: { ...room.amenities } // Deep copy the amenities object
    };
    setSelectedRoom(roomCopy);
    setIsEdited(false);
    setIsDrawerOpen(true);
  };

  // Save the room and reset state
  const handleSaveRoom = (roomData: any) => {
    if (selectedRoom) {
      // Update existing room
      setRooms(rooms.map(room => 
        room === selectedRoom ? {
          ...room,
          ...roomData,
          price: listingCategory?.pricingType === 'ROOM_BASED' 
            ? parseFloat(roomData.price) 
            : null,
          maxTenantCount: parseInt(roomData.maxTenantCount) || 1
        } : room
      ));
    } else {
      // Add new room
      setRooms([...rooms, {
        ...roomData,
        id: Math.random().toString(36).substr(2, 9), // Temporary ID
        price: listingCategory?.pricingType === 'ROOM_BASED' 
          ? parseFloat(roomData.price) 
          : null,
        maxTenantCount: parseInt(roomData.maxTenantCount) || 1
      }]);
    }
    setIsDrawerOpen(false);
    setSelectedRoom(null);
  };

  // Handle closing the drawer with unsaved changes
  const handleCancel = () => {
    if (isEdited) {
      setIsModalOpen(true); // Show cancel confirmation modal
    } else {
      handleCloseDrawer(); // Close drawer if no changes
    }
  };

  // New function to handle actual drawer closing
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRoom(null);
    setIsEdited(false);
  };

  // Confirm cancel and close the drawer
  const confirmCancel = () => {
    setIsModalOpen(false); // Close the modal first
    handleCloseDrawer(); // Then close the drawer
  };

  // Close the cancel modal without action
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle deleting a room
  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room); // Set room to delete
    setIsDeleteModalOpen(true); // Show delete confirmation modal
  };

  // Confirm room deletion
  const confirmDeleteRoom = () => {
    if (roomToDelete) {
      const updatedRooms = rooms.filter((room) => room !== roomToDelete);
      setRooms(updatedRooms);
      toast.success('Room deleted successfully');
    }
    setIsDeleteModalOpen(false);
  };

  // Close the delete modal without action
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <Heading 
        title="Add rooms of your place" 
        subtitle="Help tenants explore your space by adding room details." 
      />

      {/* Main Content */}
      <div className="">
        {rooms.length > 0 ? (
          <>
            {/* Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col bg-white"
                >
                  {/* Image Section */}
                  <div className="relative w-full h-48 group">
                    {(room.images?.length > 0) ? (
                      <>
                        <Image
                          src={room.images[0]}
                          alt={room.title || `Room ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {listingCategory?.pricingType === 'ROOM_BASED' && room.price && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                            ₱{room.price.toLocaleString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <BsDoorOpenFill size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {room.title || `Room ${index + 1}`}
                      </h3>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                        {room.roomCategory}
                      </span>
                    </div>
                    
                    {/* Only show price for room-based pricing */}
                    {listingCategory?.pricingType === 'ROOM_BASED' && room.price !== null && room.price > 0 && (
                      <p className="text-lg font-semibold text-indigo-600 mt-auto">
                        ₱{room.price.toLocaleString()}/month
                      </p>
                    )}
                  </div>

                  {/* Amenities count */}
                  <div className="px-4 pb-2">
                    {Object.values(room.amenities || {}).filter(a => a.selected).length > 0 && (
                      <div className="text-sm text-gray-600">
                        {Object.values(room.amenities).filter(a => a.selected).length} amenities selected
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="border-t p-3 bg-gray-50 flex justify-between">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors duration-200"
                      onClick={() => handleEditRoom(room)}
                    >
                      <MdModeEdit size={16} /> Edit
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                      onClick={() => handleDeleteRoom(room)}
                    >
                      <AiFillDelete size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Rooms Button */}
            <button
              type="button"
              onClick={handleAddRoom}
              className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-lg text-indigo-500 hover:text-indigo-700 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Add Another Room
            </button>
          </>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
              <BsDoorOpenFill size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Rooms Added Yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start adding rooms to your property. Each room can have its own details, 
                images, and pricing information.
              </p>
              <button
                type="button"
                onClick={handleAddRoom}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <span className="text-xl">+</span> Add Your First Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawers and Modals */}
      <RoomDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCancel}
        onActualClose={handleCloseDrawer}
        room={selectedRoom}
        onSave={handleSaveRoom}
        onChange={setIsEdited}
        listingCategory={listingCategory}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={confirmCancel}
        title="Are you sure you want to cancel?"
        body={<p className="text-gray-700">The details you added will be discarded.</p>}
        actionLabel="Yes, Cancel"
        secondaryAction={handleModalClose}
        secondaryActionLabel="No, Go Back"
        size='sm'
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onSubmit={confirmDeleteRoom}
        title="Are you sure you want to delete this room?"
        body={<p className="text-gray-700">This action cannot be undone.</p>}
        actionLabel="Yes, Delete"
        secondaryAction={handleDeleteModalClose}
        secondaryActionLabel="No, Keep Room"
        size='sm'
      />
    </div>
  );
};

export default AddRoom;

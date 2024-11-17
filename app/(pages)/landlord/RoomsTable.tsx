// RoomsTable Component
'use client';

import React, { useState, useEffect } from 'react';
import { SafeRoom, SafeListing } from '@/app/types';
import axios from 'axios';
import Select from 'react-select'; // Import react-select
import { AiOutlinePlusCircle } from 'react-icons/ai';
import Link from 'next/link';

interface RoomsTableProps {
  listings: SafeListing[]; // Array of listings passed from the parent
}

const ITEMS_PER_PAGE = 5;

const RoomsTable: React.FC<RoomsTableProps> = ({ listings }) => {
  const [rooms, setRooms] = useState<SafeRoom[]>([]);
  const [selectedListing, setSelectedListing] = useState<SafeListing | null>(listings.length > 0 ? listings[0] : null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<SafeRoom[]>([]);

  // Fetch rooms when a listing is selected
  useEffect(() => {
    if (selectedListing && selectedListing.id) {
      axios
        .get(`/api/rooms?listingId=${selectedListing.id}`)
        .then((response) => {
          setRooms(response.data);
          setFilteredData(response.data);
          setCurrentPage(1); // Reset to first page whenever a new listing is selected
        })
        .catch((error) => {
          console.error('Error fetching rooms:', error);
        });
    } else {
      setRooms([]);
      setFilteredData([]);
    }
  }, [selectedListing]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Calculate how many empty rows are needed to maintain table height
  const emptyRowsCount = ITEMS_PER_PAGE - currentData.length;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Options for the react-select dropdown
  const listingOptions = listings.map((listing) => ({
    value: listing.id,
    label: listing.title,
  }));

  // Set default selected option
  const defaultSelectedOption = selectedListing
    ? { value: selectedListing.id, label: selectedListing.title }
    : null;

  return (
    <div className="bg-white shadow rounded-lg p-8">
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="divide-y divide-gray-100">
              <div className="pt-3">
                <div className="text-xl font-semibold mb-8 flex flex-row justify-between items-center">
                  Rooms
                  {selectedListing ? (
                    <Link
                      href={`/landlord/listings/add-room?listingId=${selectedListing.id}&listingTitle=${encodeURIComponent(
                        selectedListing.title
                      )}`}
                      className="md:block text-sm font-semibold py-3 px-4 rounded-lg hover:bg-green-200 transition cursor-pointer bg-green-100"
                    >
                      <AiOutlinePlusCircle size={18} className="inline" /> Add Room
                    </Link>
                  ) : (
                    <div
                      className="md:block text-sm font-semibold py-3 px-4 rounded-lg bg-green-100 opacity-50 cursor-not-allowed"
                    >
                      <AiOutlinePlusCircle size={18} className="inline" /> Add Room
                    </div>
                  )}
                </div>
                <div className="relative max-w-xs mb-3">
                  <Select
                    options={listingOptions}
                    value={defaultSelectedOption}
                    placeholder="Select Listing"
                    isClearable
                    onChange={(option) =>
                      setSelectedListing(listings.find((listing) => listing.id === option?.value) || null)
                    }
                  />
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Title
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Description
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Room Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                    {currentData.length > 0 ? (
                      currentData.map((room) => (
                        <tr key={room.id} className="h-16"> {/* Fixed row height */}
                          <td className="px-6 py-4 text-sm text-gray-900" style={{ minHeight: '50px' }}> {/* Fixed cell height */}
                            {room.title || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900" style={{ minHeight: '50px' }}> {/* Fixed cell height */}
                            {/* {room.description || '-'} */}
                            &apos
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900" style={{ minHeight: '50px' }}> {/* Fixed cell height */}
                            {room.roomCategory || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No rooms available for the selected listing.
                        </td>
                      </tr>
                    )}

                    {/* Add empty rows to maintain consistent table height */}
                    {emptyRowsCount > 0 &&
                      Array.from({ length: emptyRowsCount }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="h-16 bg-gray-100"> {/* Fixed row height */}
                          <td className="px-6 py-4" style={{ minHeight: '50px' }}> {/* Empty cell */}
                            &nbsp;
                          </td>
                          <td className="px-6 py-4" style={{ minHeight: '50px' }}> {/* Empty cell */}
                            &nbsp;
                          </td>
                          <td className="px-6 py-4" style={{ minHeight: '50px' }}> {/* Empty cell */}
                            &nbsp;
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              {filteredData.length > 0 && (
                <div className="py-2 px-4">
                  <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <button
                      type="button"
                      className="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                      aria-label="Previous"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <span aria-hidden="true">«</span>
                      <span className="sr-only">Previous</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full ${
                          currentPage === index + 1 ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                      aria-label="Next"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Next</span>
                      <span aria-hidden="true">»</span>
                    </button>
                  </nav>
                </div>
              )}
              {/* End of Pagination */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsTable;

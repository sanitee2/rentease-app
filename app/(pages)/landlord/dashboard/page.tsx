'use client';
import LoadingState from '@/app/components/LoadingState';
import React, { useState } from 'react';

const Dashboard = () => {
  return (
    <div className="">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Card 1</h2>
            <p className="mt-4 text-gray-600">Some content goes here...</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Card 2</h2>
            <p className="mt-4 text-gray-600">Some content goes here...</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Card 3</h2>
            <p className="mt-4 text-gray-600">Some content goes here...</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Card 4</h2>
            <p className="mt-4 text-gray-600">Some content goes here...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

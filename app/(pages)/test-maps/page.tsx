'use client'
import MapComponent from "@/app/components/inputs/MapComponent";


const TestMap = () => {
  const handleLocationChange = (location: { lat: number; lng: number }) => {
    // You can use this location data in your form
  };

  return (
    <div>
      <h1>Add a New Listing</h1>
      <MapComponent onLocationChange={handleLocationChange} />
    </div>
  );
};

export default TestMap;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvent } from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Image from 'next/image';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

interface MapComponentProps {
  onLocationChange: (value: { latlng: number[] }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationChange }) => {
  const [lat, setLat] = useState(9.7905028); // Initial latitude
  const [lng, setLng] = useState(125.4935697); // Initial longitude
  const [address, setAddress] = useState('');

  const handleDragEnd = (center: { lat: number; lng: number }) => {
    setLat(center.lat);
    setLng(center.lng);
    onLocationChange({ latlng: [center.lat, center.lng] });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = response.data;
      const address = `${data.address.road === undefined ? '' : data.address.road + ', '}${data.address.city}, ${data.address.state}`;
      setAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    reverseGeocode(lat, lng);
  }, [lat, lng]);

  function MapEventsHandler() {
    useMapEvent('moveend', (event) => {
      const map = event.target;
      handleDragEnd(map.getCenter());
    });
    return null;
  }

  const bounds = new LatLngBounds(
    [[9.7500, 125.4500], [9.8100, 125.5300]]
  );

  return (
    <div className="relative">
      <MapContainer
        center={[lat, lng]}
        zoom={17}
        className="h-[40vh] rounded-lg relative"
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MapEventsHandler />
        {/* Marker image centered over the map */}
        <Image
          src={markerIcon.src}
          alt="Marker"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ zIndex: 1000 }}
        />
      </MapContainer>
      {/* <h2>{address}</h2> */}
    </div>
  );
};

export default MapComponent;

import { Libraries } from '@react-google-maps/api';

// Static libraries array that can be reused across components
export const GOOGLE_MAPS_LIBRARIES: Libraries = ['places', 'geometry'];

// Other Google Maps related constants
export const GOOGLE_MAPS_OPTIONS = {
  componentRestrictions: { 
    country: 'ph',
  },
  types: ['address'],
  bounds: {
    north: 9.8527, // Surigao City bounds
    south: 9.7155,
    east: 125.5439,
    west: 125.4571
  },
  strictBounds: true,
  fields: ['address_components', 'geometry', 'formatted_address'],
}; 
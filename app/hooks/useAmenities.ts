import { create } from 'zustand';
import { toast } from 'react-hot-toast';

interface Amenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

interface AmenitiesStore {
  propertyAmenities: Amenity[];
  roomAmenities: Amenity[];
  loading: boolean;
  error: string | null;
  fetchAmenities: () => Promise<void>;
}

const useAmenities = create<AmenitiesStore>((set) => ({
  propertyAmenities: [],
  roomAmenities: [],
  loading: false,
  error: null,
  fetchAmenities: async () => {
    set({ loading: true });
    try {
      const [propertyRes, roomRes] = await Promise.all([
        fetch('/api/amenities/property'),
        fetch('/api/amenities/room')
      ]);

      if (!propertyRes.ok || !roomRes.ok) {
        throw new Error('Failed to fetch amenities');
      }

      const propertyData = await propertyRes.json();
      const roomData = await roomRes.json();


      set({ 
        propertyAmenities: propertyData,
        roomAmenities: roomData,
        loading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch amenities', loading: false });
      toast.error('Failed to load amenities');
    }
  }
}));

export default useAmenities; 
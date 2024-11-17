import { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeListing } from '@/app/types';

export const useUserListings = () => {
  const [listings, setListings] = useState<SafeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/listings/own');
        setListings(response.data);
      } catch (err) {
        setError('Failed to fetch listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  return { listings, isLoading, error };
};
import { useState, useCallback } from 'react';
import axios from 'axios';
import { MinimalUser } from '@/app/types';

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<MinimalUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (search: string) => {
    if (!search || search.length < 3) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/users/available?search=${encodeURIComponent(search)}`);
      setUsers(response.data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Failed to search users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, isLoading, error, searchUsers };
};
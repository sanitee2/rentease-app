import { useState, useEffect } from 'react';
import axios from 'axios';
import { MinimalUser } from '@/app/types';

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<MinimalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/users/available');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch available users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
};
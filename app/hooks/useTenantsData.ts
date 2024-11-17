import { useState, useEffect } from 'react';
import { SafeListing, SafeUser, TenantData } from '@/app/types';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserListings from '@/app/actions/getUserListings';
import getTenants from '@/app/actions/getTenants';

export const useTenantsData = () => {
  const [data, setData] = useState<{
    currentUser: SafeUser | null;
    listings: SafeListing[];
    tenants: TenantData[];
  }>({
    currentUser: null,
    listings: [],
    tenants: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user first
        const user = await getCurrentUser();
        
        if (!user) {
          setIsAuthorized(false);
          setData({ currentUser: null, listings: [], tenants: [] });
          return;
        }

        if (user.role !== 'LANDLORD') {
          setIsAuthorized(false);
          setData({ currentUser: null, listings: [], tenants: [] });
          setError('Access denied: Not a landlord');
          return;
        }

        // Only fetch additional data if user is authorized
        const [fetchedListings, fetchedTenants] = await Promise.all([
          getUserListings(user.id).catch(() => []),
          getTenants(user.id).catch(() => [])
        ]);

        if (isMounted) {
          setData({
            currentUser: user,
            listings: fetchedListings,
            tenants: fetchedTenants
          });
          setIsAuthorized(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error('TenantsData Error:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setIsAuthorized(false);
          setData({ currentUser: null, listings: [], tenants: [] });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...data,
    isLoading,
    error,
    isAuthorized,
    refetch: () => setData({ ...data }) // Add refetch capability
  };
};
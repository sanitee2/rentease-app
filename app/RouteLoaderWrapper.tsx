'use client'; // Required for client-side hooks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use useRouter from next/navigation for the app directory
import FullScreenLoader from './FullScreenLoader'; // Import the loader component

const RouteLoaderWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to track loading
  const [isClient, setIsClient] = useState(false); // Track if we're on the client side

  useEffect(() => {
    // Ensure this code only runs on the client
    setIsClient(true);

    const handleStart = () => {
      setLoading(true); // Show loader when route change starts
    };

    const handleComplete = () => {
      setLoading(false); // Hide loader when route completes
    };

    // Use manual navigation event handling for client-side transitions
    const originalPush = router.push;

    // Override router.push to include loading behavior
    router.push = async (url, options) => {
      handleStart();
      try {
        await originalPush(url, options);
      } finally {
        handleComplete();
      }
    };

    return () => {
      // Clean up if necessary, restore the original router.push method
      router.push = originalPush;
    };
  }, [router]);

  if (!isClient) {
    // If we are server-side rendering, do nothing
    return <>{children}</>;
  }

  return (
    <>
      {loading && <FullScreenLoader />} {/* Show the full-screen loader when loading */}
      {children} {/* Render children (content) */}
    </>
  );
};

export default RouteLoaderWrapper;

'use client';

import { Button } from "@/components/ui/button";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import { NotificationType, NotificationStatus } from "@/app/types/notifications";
import { toast } from "react-hot-toast";
import { useState } from "react";

export default function TestLandlordNotificationButton() {
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const testNotification = {
        type: NotificationType.NEW_LISTING,
        title: 'Test Landlord Notification',
        message: `Test notification sent at ${new Date().toLocaleTimeString()}`,
        status: NotificationStatus.INFO,
        isRead: false,
        listingId: `test-${Date.now()}`,
        landlordId: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // First try to send via API
      const response = await fetch('/api/test/landlord-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNotification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      // If API call succeeds, add to local notifications
      // await addNotification(testNotification);
      
      toast.success('Test landlord notification sent successfully');
      console.log('[Test] Notification sent:', data);

    } catch (error: any) {
      console.error('Error sending test landlord notification:', error);
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {/* <Button
      onClick={handleClick}
      variant="destructive"
      size="sm"
      className="mb-2"
      disabled={isLoading}
    >
      {isLoading ? 'Sending...' : 'Send Test Landlord Notification'}
    </Button> */}
    </>
  );
} 
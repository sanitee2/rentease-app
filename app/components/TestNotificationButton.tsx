'use client';

import { Button } from "@/components/ui/button";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import { NotificationType, NotificationStatus } from "@/app/types/notifications";
import { toast } from "react-hot-toast";

export default function TestNotificationButton() {
  const { addNotification } = useNotifications();

  const handleClick = async () => {
    try {
      const testNotification = {
        type: NotificationType.NEW_LISTING,
        title: 'Test Notification',
        message: 'This is a test notification',
        status: NotificationStatus.INFO,
        isRead: false,
        listingId: 'test-listing-123',
        landlordId: 'test-landlord-456',
        createdAt: new Date().toISOString(),
      };

      await addNotification(testNotification);
      toast.success('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send notification');
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="destructive"
      size="sm"
      className="mb-2"
    >
      Send Test Notification
    </Button>
  );
} 
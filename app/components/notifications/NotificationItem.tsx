'use client';

import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AdminNotification } from '@/app/types/notifications';
import { LuCheck } from 'react-icons/lu';

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead
}) => {
  const formattedDate = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true
  });

  return (
    <div className={`
      p-4 rounded-lg border
      ${notification.isRead ? 'bg-gray-50' : 'bg-white'}
      ${notification.status === 'ERROR' ? 'border-red-200' : 
        notification.status === 'WARNING' ? 'border-yellow-200' : 
        notification.status === 'SUCCESS' ? 'border-green-200' : 
        'border-gray-200'}
    `}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formattedDate}
          </p>
        </div>
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMarkAsRead(notification.id)}
          >
            <LuCheck className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem; 
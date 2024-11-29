export enum NotificationType {
  NEW_LISTING = 'NEW_LISTING',
  REPORTED_CONTENT = 'REPORTED_CONTENT',
  USER_VERIFICATION = 'USER_VERIFICATION',
  LISTING_APPROVED = 'LISTING_APPROVED',
  LISTING_DECLINED = 'LISTING_DECLINED'
}

export enum NotificationStatus {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface BaseNotification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export interface UserNotification extends BaseNotification {
  userId: string;
}

export interface AdminNotification extends BaseNotification {
  listingId: string;
  landlordId: string;
}

export interface AdminNewListingData {
  listingId: string;
  landlordId: string;
  message: string;
}

// Type guard for notification types
export function isAdminNotification(notification: any): notification is AdminNotification {
  return (
    notification &&
    Object.values(NotificationType).includes(notification.type) &&
    Object.values(NotificationStatus).includes(notification.status)
  );
} 
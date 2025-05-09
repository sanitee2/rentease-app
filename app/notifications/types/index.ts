export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface NotificationTemplate {
  email: EmailTemplate;
  sms: string;
}

export interface NotificationResult {
  email: boolean;
  sms: boolean;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
}

export interface SMSPayload {
  to: string;
  message: string;
  from?: string;
  type?: 'plain' | 'unicode';
}

export interface BaseNotificationParams {
  email?: string | null;
  phone?: string | null;
  name: string;
}

export interface PaymentNotificationParams extends BaseNotificationParams {
  amount: string;
  propertyName: string;
  landlordName: string;
  periodStart?: string;
  periodEnd?: string;
} 
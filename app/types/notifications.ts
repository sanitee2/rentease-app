export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface NotificationTemplates {
  paymentConfirmation: {
    email: EmailTemplate;
    sms: string;
  };
  // Add more templates as needed
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
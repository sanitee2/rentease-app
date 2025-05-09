export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SMSPayload {
  to: string;
  message: string;
  from?: string;
  type?: 'plain' | 'unicode';
}

export interface NotificationTemplate {
  email: {
    subject: string;
    body: string;
  };
  sms: {
    message: string;
  };
} 
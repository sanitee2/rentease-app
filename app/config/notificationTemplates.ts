import { NotificationTemplates } from '@/app/types/notifications';

export const templates: NotificationTemplates = {
  paymentConfirmation: {
    email: {
      subject: 'Payment Confirmation - RentEase',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Confirmation</h2>
          <p>Dear {{tenantName}},</p>
          <p>Your payment of <strong>₱{{amount}}</strong> has been confirmed and processed successfully.</p>
          <p>Payment Details:</p>
          <ul>
            <li>Property: {{propertyName}}</li>
            <li>Period: {{periodStart}} to {{periodEnd}}</li>
            <li>Date Confirmed: {{confirmationDate}}</li>
          </ul>
          <p>Thank you for using RentEase!</p>
        </div>
      `
    },
    sms: "Dear {{tenantName}}, your payment of ₱{{amount}} for {{propertyName}} has been confirmed. Thank you for using RentEase!"
  }
}; 
import { NotificationTemplate } from '../types';

export const paymentTemplate: NotificationTemplate = {
  email: {
    subject: 'Payment Confirmation - RentEase',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Confirmation</h2>
        <p>Dear {{name}},</p>
        <p>Your payment of <strong>₱{{amount}}</strong> has been confirmed and processed successfully by {{landlordName}}.</p>
        <p>Payment Details:</p>
        <ul>
          <li>Property: {{propertyName}}</li>
          <li>Period: {{periodStart}} to {{periodEnd}}</li>
          <li>Date Confirmed: {{confirmationDate}}</li>
          <li>Confirmed by: {{landlordName}}</li>
        </ul>
        <p>Thank you for using RentEase!</p>
      </div>
    `
  },
  sms: "Dear {{name}}, your payment of ₱{{amount}} for {{propertyName}} has been confirmed by {{landlordName}}. Thank you for using RentEase!"
}; 
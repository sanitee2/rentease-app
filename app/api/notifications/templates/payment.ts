import { NotificationTemplate } from '../types';

export function getPaymentConfirmationTemplate(data: {
  tenantName: string;
  propertyAddress: string;
  amount: number;
  paymentId: string;
  paymentDate: string;
}): NotificationTemplate {
  return {
    email: {
      subject: `Payment Confirmation #${data.paymentId}`,
      body: `
        <h2>Payment Confirmation</h2>
        <p>Hello ${data.tenantName},</p>
        <p>Your payment has been successfully processed for ${data.propertyAddress}.</p>
        <p>
          <strong>Amount:</strong> $${data.amount.toFixed(2)}<br>
          <strong>Payment ID:</strong> ${data.paymentId}<br>
          <strong>Date:</strong> ${data.paymentDate}
        </p>
        <p>Thank you for your payment!</p>
      `,
    },
    sms: {
      message: `Payment of $${data.amount.toFixed(2)} received for ${data.propertyAddress}. Payment ID: ${data.paymentId}. Thank you!`,
    },
  };
}

export function getPaymentReminderTemplate(data: {
  tenantName: string;
  propertyAddress: string;
  amount: number;
  dueDate: string;
}): NotificationTemplate {
  return {
    email: {
      subject: `Rent Payment Reminder - ${data.propertyAddress}`,
      body: `
        <h2>Rent Payment Reminder</h2>
        <p>Hello ${data.tenantName},</p>
        <p>This is a friendly reminder that your rent payment of $${data.amount.toFixed(2)} for ${data.propertyAddress} is due on ${data.dueDate}.</p>
        <p>Please ensure your payment is made on time to avoid any late fees.</p>
        <p>If you have already made the payment, please disregard this message.</p>
      `,
    },
    sms: {
      message: `Reminder: Rent payment of $${data.amount.toFixed(2)} for ${data.propertyAddress} is due on ${data.dueDate}. Please pay on time to avoid late fees.`,
    },
  };
} 
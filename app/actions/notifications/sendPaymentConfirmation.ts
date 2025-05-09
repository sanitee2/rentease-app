'use server'

import { sendNotification } from './sendNotification';

interface SendPaymentConfirmationParams {
  tenantEmail: string | null;
  tenantPhone: string | null;
  tenantName: string;
}

function formatPhoneNumber(phoneNumber: string | null): string | null {
  if (!phoneNumber) return null;
  
  // Remove any non-numeric characters
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  // If number starts with 0, replace it with +63
  if (cleanNumber.startsWith('0')) {
    return `+63${cleanNumber.slice(1)}`;
  }
  
  // If already has 63, add +
  if (cleanNumber.startsWith('63')) {
    return `+${cleanNumber}`;
  }
  
  return cleanNumber;
}

export async function sendPaymentConfirmation({
  tenantEmail,
  tenantPhone,
  tenantName,
}: SendPaymentConfirmationParams) {
  try {
    const payload: Parameters<typeof sendNotification>[0] = {};

    if (tenantEmail) {
      payload.email = {
        to: tenantEmail,
        subject: 'Payment Confirmation',
        body: `
          <h2>Payment Confirmation</h2>
          <p>Dear ${tenantName},</p>
          <p>Your payment has been confirmed and processed successfully.</p>
          <p>Thank you for using RentEase!</p>
        `,
      };
    }

    if (tenantPhone) {
      const formattedPhone = formatPhoneNumber(tenantPhone);
      if (formattedPhone) {
        payload.sms = {
          to: formattedPhone,
          message: `Dear ${tenantName}, your payment has been confirmed. Thank you for using RentEase!`,
          type: 'plain',
        };
      }
    }

    return await sendNotification(payload);
  } catch (error) {
    console.error('Notification Error:', error);
    return {
      email: false,
      sms: false,
    };
  }
} 
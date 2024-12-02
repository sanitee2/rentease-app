'use server'

import { sendEmail } from '../services/email';
import { sendSMS } from '../services/sms';
import { paymentTemplate } from '../templates/payment';
import { PaymentNotificationParams, NotificationResult } from '../types';

function replaceTemplateVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

export async function sendPaymentNotification({
  email,
  phone,
  name,
  amount,
  propertyName,
  periodStart,
  periodEnd,
}: PaymentNotificationParams): Promise<NotificationResult> {
  const templateVars = {
    name,
    amount,
    propertyName,
    periodStart: periodStart || 'N/A',
    periodEnd: periodEnd || 'N/A',
    confirmationDate: new Date().toLocaleDateString(),
  };

  const results: NotificationResult = {
    email: false,
    sms: false,
  };

  if (email) {
    const emailBody = replaceTemplateVars(paymentTemplate.email.body, templateVars);
    const emailSubject = replaceTemplateVars(paymentTemplate.email.subject, templateVars);

    results.email = await sendEmail({
      to: email,
      subject: emailSubject,
      body: emailBody,
    });
  }

  if (phone) {
    const smsMessage = replaceTemplateVars(paymentTemplate.sms, templateVars);

    results.sms = await sendSMS({
      to: phone,
      message: smsMessage,
    });
  }

  return results;
} 
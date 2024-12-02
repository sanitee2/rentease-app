'use server'

import nodemailer from 'nodemailer';
import axios from 'axios';
import { EMAIL_CONFIG, SMS_CONFIG } from '@/app/api/notifications/config';
import { EmailPayload, SMSPayload } from '@/app/types/notifications';
import { templates } from '@/app/config/notificationTemplates';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

function replaceTemplateVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.error('[Email] ❌ Error: Email credentials not configured');
      return false;
    }

    await transporter.sendMail({
      from: payload.from || EMAIL_CONFIG.defaultFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.body,
      replyTo: payload.replyTo,
    });
    
    console.log('[Email] ✅ Sent to:', payload.to);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendSMS(payload: SMSPayload): Promise<boolean> {
  try {
    if (!SMS_CONFIG.apiKey) {
      console.error('[SMS] ❌ Error: SMS_API_KEY not configured');
      return false;
    }

    const response = await axios.post(
      'https://app.philsms.com/api/v3/sms/send',
      {
        recipient: payload.to,
        message: payload.message,
        sender_id: payload.from || SMS_CONFIG.defaultFrom,
        type: payload.type || 'plain',
      },
      {
        headers: {
          'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.status === 200) {
      console.log('[SMS] ✅ Sent to:', payload.to);
      return true;
    }
    
    console.error('[SMS] ❌ Failed:', response.status, response.data);
    return false;
  } catch (error) {
    console.error('[SMS] ❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendPaymentConfirmation({
  tenantEmail,
  tenantPhone,
  tenantName,
  amount,
  propertyName,
  periodStart,
  periodEnd,
}: {
  tenantEmail?: string | null;
  tenantPhone?: string | null;
  tenantName: string;
  amount: string;
  propertyName: string;
  periodStart?: string;
  periodEnd?: string;
}) {
  const templateVars = {
    tenantName,
    amount,
    propertyName,
    periodStart: periodStart || 'N/A',
    periodEnd: periodEnd || 'N/A',
    confirmationDate: new Date().toLocaleDateString(),
  };

  const results = {
    email: false,
    sms: false,
  };

  if (tenantEmail) {
    const emailBody = replaceTemplateVars(templates.paymentConfirmation.email.body, templateVars);
    const emailSubject = replaceTemplateVars(templates.paymentConfirmation.email.subject, templateVars);

    results.email = await sendEmail({
      to: tenantEmail,
      subject: emailSubject,
      body: emailBody,
    });
  }

  if (tenantPhone) {
    const smsMessage = replaceTemplateVars(templates.paymentConfirmation.sms, templateVars);

    results.sms = await sendSMS({
      to: tenantPhone,
      message: smsMessage,
    });
  }

  return results;
} 
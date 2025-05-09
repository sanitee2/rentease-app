'use server';

import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '@/app/api/notifications/config';
import { EmailPayload } from '@/app/api/notifications/types';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: payload.from || EMAIL_CONFIG.defaultFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.body,
      replyTo: payload.replyTo,
      attachments: payload.attachments,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
} 
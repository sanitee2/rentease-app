'use server'

import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '@/app/api/notifications/config';
import { EmailPayload } from '../types';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

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
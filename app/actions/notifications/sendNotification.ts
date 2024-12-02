'use server'

import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '@/app/api/notifications/config';
import axios from 'axios';
import { SMS_CONFIG } from '@/app/api/notifications/config';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

interface NotificationPayload {
  email?: {
    to: string;
    subject: string;
    body: string;
    from?: string;
    replyTo?: string;
  };
  sms?: {
    to: string;
    message: string;
    from?: string;
    type?: 'plain' | 'unicode';
  };
}

export async function sendNotification(payload: NotificationPayload) {
  const results = {
    email: false,
    sms: false,
  };

  // Handle email
  if (payload.email) {
    console.log('📧 [Email] Attempting to send email...');
    console.log('📧 [Email] Recipient:', payload.email.to);
    
    try {
      if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
        console.error('📧 [Email] ❌ Error: Email credentials not configured');
      } else {
        console.log('📧 [Email] Using SMTP config:', {
          host: EMAIL_CONFIG.host,
          port: EMAIL_CONFIG.port,
          user: EMAIL_CONFIG.auth.user,
          from: payload.email.from || EMAIL_CONFIG.defaultFrom
        });

        await transporter.sendMail({
          from: payload.email.from || EMAIL_CONFIG.defaultFrom,
          to: payload.email.to,
          subject: payload.email.subject,
          html: payload.email.body,
          replyTo: payload.email.replyTo,
        });
        
        console.log('📧 [Email] ✅ Successfully sent to:', payload.email.to);
        results.email = true;
      }
    } catch (error) {
      console.error('📧 [Email] ❌ Failed to send:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recipient: payload.email.to,
        config: {
          host: EMAIL_CONFIG.host,
          port: EMAIL_CONFIG.port,
          user: EMAIL_CONFIG.auth.user ? '✓ Set' : '✗ Missing',
          pass: EMAIL_CONFIG.auth.pass ? '✓ Set' : '✗ Missing'
        }
      });
    }
  }

  // Handle SMS
  if (payload.sms) {
    console.log('📱 [SMS] Attempting to send SMS...');
    console.log('📱 [SMS] Recipient:', payload.sms.to);

    try {
      if (!SMS_CONFIG.apiKey) {
        console.error('📱 [SMS] ❌ Error: SMS_API_KEY not configured');
      } else {
        console.log('📱 [SMS] Request details:', {
          recipient: payload.sms.to,
          sender: payload.sms.from || SMS_CONFIG.defaultFrom,
          messageLength: payload.sms.message.length,
          type: payload.sms.type || 'plain'
        });

        const response = await axios.post(
          'https://app.philsms.com/api/v3/sms/send',
          {
            recipient: payload.sms.to,
            message: payload.sms.message,
            sender_id: payload.sms.from || SMS_CONFIG.defaultFrom,
            type: payload.sms.type || 'plain',
          },
          {
            headers: {
              'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000,
          }
        );

        if (response.status === 200) {
          console.log('📱 [SMS] ✅ Successfully sent to:', payload.sms.to, {
            statusCode: response.status,
            responseData: response.data
          });
          results.sms = true;
        } else {
          console.error('📱 [SMS] ⚠️ Non-200 status code:', {
            statusCode: response.status,
            responseData: response.data
          });
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('📱 [SMS] ❌ API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          recipient: payload.sms.to,
          config: {
            apiKey: SMS_CONFIG.apiKey ? '✓ Set' : '✗ Missing',
            defaultFrom: SMS_CONFIG.defaultFrom
          }
        });
      } else {
        console.error('📱 [SMS] ❌ Unknown error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          recipient: payload.sms.to
        });
      }
    }
  }

  console.log('📨 [Notification] Final results:', {
    email: results.email ? '✅ Sent' : '❌ Failed/Not Attempted',
    sms: results.sms ? '✅ Sent' : '❌ Failed/Not Attempted'
  });

  return results;
} 
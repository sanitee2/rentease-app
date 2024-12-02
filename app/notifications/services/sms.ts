'use server'

import axios from 'axios';
import { SMS_CONFIG } from '@/app/api/notifications/config';
import { SMSPayload } from '../types';

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
          'Accept': 'application/json'
        },
        timeout: 10000,
      }
    );

    if (response.status === 200) {
      console.log('[SMS] ✅ Sent to:', payload.to);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[SMS] ❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
} 
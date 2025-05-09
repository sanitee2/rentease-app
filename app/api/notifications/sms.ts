import axios from 'axios';
import { SMS_CONFIG } from './config';
import { SMSPayload } from './types';

export async function sendSMS(payload: SMSPayload): Promise<boolean> {
  try {
    if (!SMS_CONFIG.apiKey) {
      console.error('SMS_API_KEY not configured');
      return false;
    }

    const requestBody = {
      recipient: payload.to,
      message: payload.message,
      sender_id: payload.from || SMS_CONFIG.defaultFrom,
      type: payload.type || 'plain',
    };

    console.log('📤 SMS Request:', {
      url: 'https://app.philsms.com/api/v3/sms/send',
      body: requestBody
    });

    const response = await axios.post(
      'https://app.philsms.com/api/v3/sms/send',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.status !== 200) {
      console.error('SMS API returned non-200 status:', response.status);
      return false;
    }

    console.log('📥 API Response:', {
      status: response.status,
      data: response.data
    });

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('🚨 SMS API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('🚨 SMS Error:', error);
    }
    return false;
  }
} 
import { sendEmail } from './email';
import { sendSMS } from './sms';
import { EmailPayload, SMSPayload } from './types';

export class NotificationService {
  static async sendNotification({
    email,
    sms,
  }: {
    email?: EmailPayload;
    sms?: SMSPayload;
  }) {
    const results = {
      email: false,
      sms: false,
    };

    if (email) {
      results.email = await sendEmail(email);
    }

    if (sms) {
      results.sms = await sendSMS(sms);
    }

    return results;
  }
} 
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  defaultFrom: process.env.DEFAULT_FROM_EMAIL || 'your-email@yourdomain.com',
};

export const SMS_CONFIG = {
  apiKey: process.env.SMS_API_KEY || '',
  defaultFrom: process.env.SMS_DEFAULT_FROM || 'PhilSMS',
};
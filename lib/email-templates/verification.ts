interface VerificationEmailProps {
  name: string;
  code: string;
  expiresIn: string;
}

export function createVerificationEmailTemplate({ name, code, expiresIn }: VerificationEmailProps) {
  return {
    subject: "Verify Your Email - RentEase",
    body: `
      <p>Hello ${name},</p>
      <p>Welcome to RentEase! Please use the following code to verify your email address:</p>
      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center;">
        <h2 style="margin: 0; font-size: 32px; letter-spacing: 4px; color: #0066cc;">${code}</h2>
      </div>
      <p>This code will expire in ${expiresIn}.</p>
      <p><strong>Note:</strong> If you didn't create a RentEase account, you can safely ignore this email.</p>
    `
  }
} 
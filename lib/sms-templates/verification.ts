interface VerificationSMSProps {
  code: string;
}

export function createVerificationSMSTemplate({ code }: VerificationSMSProps) {
  return {
    type: 'verification' as const,
    content: `RentEase: Your verification code is ${code}. Valid for 10 minutes. Do not share this code.`
  }
} 
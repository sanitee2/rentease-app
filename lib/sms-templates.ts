interface SMSTemplateProps {
  type: 'test' | 'alert' | 'notification' | 'verification'
  content: string
}

export function SMSTemplate({ type, content }: SMSTemplateProps): string {
  // Ensure message fits SMS length limits
  const truncatedContent = content.slice(0, 160)
  return truncatedContent
} 
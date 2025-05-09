'use server'

import { sendNotification } from "@/app/actions/notifications/sendNotification"
import { EmailTemplate } from "@/lib/email-templates"
import { SMSTemplate } from "@/lib/sms-templates"
import { getFormattedDateTime } from "@/lib/utils/date"

// Email Templates
const createTestEmailTemplate = (timestamp: string) => ({
  subject: "System Test Notification - Email Service",
  body: EmailTemplate({
    title: "Email Service Test",
    preheader: "This is a test email to verify the email notification system",
    content: `
      <p>Hello,</p>
      <p>This is an automated test email sent from your system's testing dashboard.</p>
      <p><strong>Test Details:</strong></p>
      <ul>
        <li>Timestamp: ${timestamp}</li>
        <li>Service: Email Notification System</li>
        <li>Type: System Test</li>
      </ul>
      <p>If you received this email, it confirms that your email notification service is functioning correctly.</p>
      <p><strong>Note:</strong> No action is required from your end. This is just a test message.</p>
    `
  })
})

// SMS Templates
const createTestSMSTemplate = () => ({
  message: SMSTemplate({
    type: 'test',
    content: `RentEase: System test message sent at ${getFormattedDateTime()}. If received, SMS notifications are working correctly.`
  })
})

// Utility Functions
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.startsWith('63') ? cleaned : '63' + cleaned.replace(/^0/, '')
}

// Action Handlers
export async function handleEmailTest() {
  try {
    const timestamp = getFormattedDateTime()
    const template = createTestEmailTemplate(timestamp)

    const result = await sendNotification({
      email: {
        to: process.env.TEST_EMAIL_RECIPIENT || "franzmozar@gmail.com",
        subject: template.subject,
        body: template.body,
        from: process.env.DEFAULT_FROM_EMAIL || 'noreply@renteaseapp.com',
        replyTo: 'support@renteaseapp.com'
      }
    })

    if (!result.email) {
      console.error('📧 Email test failed without throwing an error')
      return { 
        success: false, 
        error: 'Failed to send test email. Check server logs for details.' 
      }
    }

    console.log('📧 Email test completed successfully')
    return { success: true }

  } catch (error) {
    console.error('📧 Email test error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: getFormattedDateTime()
    })

    return { 
      success: false, 
      error: error instanceof Error 
        ? `Email test failed: ${error.message}`
        : 'An unexpected error occurred while testing email service'
    }
  }
}

export async function handleSMSTest() {
  try {
    const phoneNumber = formatPhoneNumber(process.env.TEST_SMS_RECIPIENT || "09514537346")
    console.log('📱 Sending SMS test to:', phoneNumber)

    const template = createTestSMSTemplate()
    const result = await sendNotification({
      sms: {
        to: phoneNumber,
        ...template,
        type: "plain"
      }
    })

    if (!result.sms) {
      console.error('📱 SMS test failed without throwing an error')
      return { 
        success: false, 
        error: 'Failed to send test SMS. Check server logs for details.' 
      }
    }

    console.log('📱 SMS test completed successfully')
    return { success: true }

  } catch (error) {
    console.error('📱 SMS test error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: getFormattedDateTime()
    })

    return { 
      success: false, 
      error: error instanceof Error 
        ? `SMS test failed: ${error.message}`
        : 'An unexpected error occurred while testing SMS service'
    }
  }
} 
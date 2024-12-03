import { sendNotification } from '@/app/actions/notifications/sendNotification';
import { format } from 'date-fns';

interface ViewingRequestNotificationParams {
  email: string | null;
  phone: string | null;
  name: string;
  status: string;
  propertyName: string;
  roomName?: string | null;
  landlordName: string;
  viewingDate: Date;
  viewingTime: Date;
  declineReason?: string;
}

export async function sendViewingRequestNotification({
  email,
  phone,
  name,
  status,
  propertyName,
  roomName,
  landlordName,
  viewingDate,
  viewingTime,
  declineReason
}: ViewingRequestNotificationParams) {
  const statusText = status === 'APPROVED' ? 'approved' : 'declined';
  const roomText = roomName ? ` (Room: ${roomName})` : '';
  const formattedDate = format(new Date(viewingDate), 'MMMM d, yyyy');
  const formattedTime = format(new Date(viewingTime), 'h:mm a');
  
  const message = `Hi ${name},

Your viewing request for ${propertyName}${roomText} has been ${statusText} by ${landlordName}.

${status === 'APPROVED' ? `Your viewing schedule is confirmed for:
Date: ${formattedDate}
Time: ${formattedTime}` : ''}

${status === 'APPROVED' ? 
  'Please arrive on time for your viewing appointment.' : 
  'You may submit another viewing request if you wish to reschedule.'}

Best regards,
RentEase Team`;

  try {
    const notificationPayload = {
      email: email ? {
        to: email,
        subject: `Viewing Request ${status}`,
        body: message
      } : undefined,
      sms: phone ? {
        to: phone,
        message: message
      } : undefined
    };

    const result = await sendNotification(notificationPayload);
    return { success: result.email || result.sms };
  } catch (error) {
    console.error('Error sending viewing request notification:', error);
    return { success: false, error };
  }
} 
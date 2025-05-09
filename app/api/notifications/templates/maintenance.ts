import { NotificationTemplate } from '../types';

export function getMaintenanceRequestTemplate(data: {
  tenantName: string;
  propertyAddress: string;
  issueDescription: string;
  requestId: string;
}): NotificationTemplate {
  return {
    email: {
      subject: `Maintenance Request #${data.requestId} - ${data.propertyAddress}`,
      body: `
        <h2>New Maintenance Request</h2>
        <p>Hello ${data.tenantName},</p>
        <p>Your maintenance request has been received for ${data.propertyAddress}.</p>
        <p><strong>Issue Description:</strong><br>${data.issueDescription}</p>
        <p>Request ID: ${data.requestId}</p>
        <p>We will review your request and get back to you shortly.</p>
      `,
    },
    sms: {
      message: `Maintenance request #${data.requestId} received for ${data.propertyAddress}. We'll review it shortly. Track status online.`,
    },
  };
} 
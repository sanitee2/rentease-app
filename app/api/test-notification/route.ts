import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NotificationStatus, NotificationType } from '@/app/types/notifications';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create notification in database
    const notificationData = {
      type: NotificationType.NEW_LISTING,
      title: 'Test Notification',
      message: `Test notification from ${currentUser.firstName} ${currentUser.lastName}`,
      status: NotificationStatus.INFO,
      isRead: false,
      listingId: `test-${Date.now()}`,
      landlordId: currentUser.id,
      userId: currentUser.id,
      createdAt: new Date(),
    };

    const savedNotification = await prisma.notification.create({
      data: notificationData
    });

    // Send notification via WebSocket server
    const socketResponse = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'admin:new_listing',
        data: {
          listingId: notificationData.listingId,
          landlordId: currentUser.id,
          message: notificationData.message
        }
      })
    });

    if (!socketResponse.ok) {
      throw new Error('Failed to send socket notification');
    }

    return NextResponse.json({ 
      success: true, 
      notification: savedNotification 
    });

  } catch (error) {
    console.error('[Test] Notification error:', error);
    return NextResponse.json(
      { error: "Failed to send test notification" }, 
      { status: 500 }
    );
  }
} 
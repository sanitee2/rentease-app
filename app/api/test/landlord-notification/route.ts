import { NextResponse } from "next/server";
import prismaClient from "@/app/libs/prismadb";
import { NotificationStatus, NotificationType } from "@/app/types/notifications";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationData = await request.json();

    // Save notification to database
    const savedNotification = await prismaClient.notification.create({
      data: {
        type: NotificationType.NEW_LISTING,
        title: notificationData.title,
        message: notificationData.message,
        status: NotificationStatus.INFO,
        isRead: false,
        listingId: notificationData.listingId,
        landlordId: currentUser.id,
        userId: currentUser.id,
        createdAt: new Date(),
      }
    });

    // Send notification via WebSocket server
    const socketResponse = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify`, {
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

  } catch (error: any) {
    console.error('[Test] Error details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3001';
    
    // Forward the notification to the socket server
    const response = await fetch(`${SOCKET_SERVER_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SOCKET_SERVER_KEY}` // Add a secret key for security
      },
      body: JSON.stringify({
        event: 'admin:new_listing',
        data: {
          listingId: 'test-listing-123',
          landlordId: 'test-landlord-456',
          message: 'Test notification: New listing submitted for review'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Socket server responded with status: ${response.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent' 
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
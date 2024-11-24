import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getIO } from '@/app/lib/socket';

export async function GET(request: Request) {
  const headersList = headers();
  
  // Add CORS headers
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });

  try {
    const io = getIO();
    
    // Handle Socket.IO polling
    if (request.url.includes('socket.io')) {
      return response;
    }

    return NextResponse.json({ success: true }, response);
  } catch (error) {
    console.error('Socket error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: response.headers }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
} 
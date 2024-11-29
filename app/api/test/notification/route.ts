// import { NextResponse } from 'next/server';
// import { getIO } from '@/app/lib/socket';

// export async function POST() {
//   try {
//     const io = getIO();
    
//     if (!io) {
//       throw new Error('Socket server not initialized');
//     }

//     // Simulate a new listing notification
//     const testData = {
//       listingId: 'test-listing-123',
//       landlordId: 'test-landlord-456',
//       message: 'Test notification: New listing submitted for review'
//     };

//     // Emit to admin room
//     io.to('admin-room').emit('admin:new_listing', testData);

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Test notification sent' 
//     });
//   } catch (error) {
//     console.error('Error sending test notification:', error);
//     return NextResponse.json(
//       { error: 'Failed to send test notification', details: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     );
//   }
// } 
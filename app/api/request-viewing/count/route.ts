import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic'

// Handle GET requests to get the count of viewing requests for a listing by a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');

    if (!userId || !listingId) {
      return NextResponse.json({ message: 'Invalid user ID or listing ID' }, { status: 400 });
    }

    // Fetch the count of viewing requests for the given userId and listingId
    const viewingCount = await prisma.requestViewing.count({
      where: {
        userId,
        listingId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ count: viewingCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching viewing count:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

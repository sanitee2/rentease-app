import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

// Handle POST requests to create a viewing request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time, roomId, userId, listingId } = body;

    // Validate input data
    if (!date || !time || !roomId || !userId || !listingId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a new viewing request in the database
    const newViewingRequest = await prisma.requestViewing.create({
      data: {
        date: new Date(date),
        time: new Date(time),
        roomId,
        userId,
        listingId,
      },
    });

    // Return the newly created viewing request
    return NextResponse.json(newViewingRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating viewing request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

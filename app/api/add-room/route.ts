import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb'; 

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageSrc, roomCategory, listingId, price } = body;

    // Validate the request data
    if (!title || !description || !imageSrc || !roomCategory || !listingId || !price) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Create a new room in the database
    const newRoom = await prisma.room.create({
      data: {
        title,
        description,
        imageSrc,
        roomCategory,
        listingId,
        price: parseFloat(price),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Return the newly created room
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Error adding room:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return new NextResponse('Listing ID is required', { status: 400 });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: {
        listingId: listingId,
      },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    });

    const safeRooms = rooms.map((room) => ({
      ...room,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    }));

    return NextResponse.json(safeRooms);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

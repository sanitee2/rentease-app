import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { 
      listingId,
      roomId,
      preferredDate,
    } = body;

    if (!listingId || !roomId || !preferredDate) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Parse the date string into a valid Date object
    const parsedDate = new Date(preferredDate);
    
    // Validate the date
    if (isNaN(parsedDate.getTime())) {
      return new NextResponse('Invalid date format', { status: 400 });
    }

    // Create viewing request with separate date and time fields
    const viewingRequest = await prisma.requestViewing.create({
      data: {
        listingId,
        roomId,
        userId: currentUser.id,
        date: parsedDate,
        time: parsedDate,
        status: 'PENDING'
      }
    });

    return NextResponse.json(viewingRequest);
  } catch (error) {
    console.error('[REQUEST_VIEWING_ROOM]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
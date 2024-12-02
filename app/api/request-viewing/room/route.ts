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
    const { date, time, roomId, listingId } = body;

    const viewing = await prisma.requestViewing.create({
      data: {
        date: new Date(date),
        time: new Date(time),
        userId: currentUser.id,
        listingId,
        roomId,
        status: 'PENDING'
      }
    });

    return NextResponse.json(viewing);
  } catch (error) {
    console.error('[VIEWING_ROOM_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
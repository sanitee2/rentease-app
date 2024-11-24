import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const rooms = await prisma.room.findMany({
      where: {
        listingId: params.listingId,
      },
      include: {
        currentTenant: true,
      }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('[ROOMS_GET]', error);
    return NextResponse.error();
  }
} 
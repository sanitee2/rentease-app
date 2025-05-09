import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const leases = await prisma.leaseContract.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        listing: true,
        room: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error('[LEASES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');

    if (!userId || !listingId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Check for pending requests
    const pendingRequest = await prisma.requestViewing.findFirst({
      where: {
        userId: userId,
        listingId: listingId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      hasPendingRequest: !!pendingRequest,
      pendingRequest: pendingRequest
    });
  } catch (error) {
    console.error('[REQUEST_VIEWING_PENDING]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
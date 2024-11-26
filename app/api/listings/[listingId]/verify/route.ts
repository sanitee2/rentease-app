import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PATCH(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { status } = body;

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify user is admin
    if (currentUser.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Validate status
    if (!['ACTIVE', 'DECLINED'].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: {
        id: params.listingId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('[LISTING_VERIFY]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
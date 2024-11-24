import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function PATCH(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { status } = await request.json();
    const { listingId } = params;

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Error updating listing status' },
      { status: 500 }
    );
  }
} 
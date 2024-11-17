import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    // First update the listing to inactive
    await prisma.listing.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    // Then delete all rooms associated with the listing
    await prisma.room.deleteMany({
      where: { listingId: id },
    });

    // Finally delete the listing
    const deletedListing = await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ 
      error: 'Failed to delete listing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

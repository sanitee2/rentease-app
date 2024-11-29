import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    // Verify the listing belongs to the current user
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing || listing.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the listing status to ARCHIVED
    const archivedListing = await prisma.listing.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    return NextResponse.json({ 
      message: 'Listing archived successfully',
      listing: archivedListing 
    }, { status: 200 });
  } catch (error) {
    console.error('Error archiving listing:', error);
    return NextResponse.json({ 
      error: 'Failed to archive listing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

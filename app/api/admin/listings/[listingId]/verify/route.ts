import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function PATCH(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'DECLINED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: {
        id: params.listingId
      },
      data: {
        status
      }
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error updating listing status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
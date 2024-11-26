import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const recentListings = await prisma.listing.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const formattedListings = recentListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      status: listing.status.toLowerCase(),
      landlord: `${listing.user.firstName} ${listing.user.lastName}`,
      date: listing.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
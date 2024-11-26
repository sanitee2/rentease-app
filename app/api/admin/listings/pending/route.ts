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

    const pendingListings = await prisma.listing.findMany({
      where: {
        status: 'PENDING'
      },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pendingListings);
  } catch (error) {
    console.error('Error fetching pending listings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
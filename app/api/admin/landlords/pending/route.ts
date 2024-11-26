import { NextResponse } from 'next/server';
import  prisma  from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const pendingLandlords = await prisma.user.findMany({
      where: {
        role: 'LANDLORD',
        landlord: {
          // isVerified: false
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        landlord: {
          select: {
            businessName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pendingLandlords);
  } catch (error) {
    console.error('Error fetching pending landlords:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
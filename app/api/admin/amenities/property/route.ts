import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const amenities = await prisma.propertyAmenity.findMany({
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Error fetching property amenities:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, icon, desc } = body;

    const amenity = await prisma.propertyAmenity.create({
      data: {
        title,
        icon,
        desc
      }
    });

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Error creating property amenity:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
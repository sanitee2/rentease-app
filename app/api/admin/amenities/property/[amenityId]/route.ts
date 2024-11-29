import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { toast } from 'react-hot-toast';

export async function PUT(
  request: Request,
  { params }: { params: { amenityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, icon, desc, category, arrangement } = body;

    const amenity = await prisma.propertyAmenity.update({
      where: {
        id: params.amenityId
      },
      data: {
        title,
        icon,
        desc,
        category,
        arrangement
      }
    });

    toast.success('Property amenity updated successfully');

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Error updating property amenity:', error);
    toast.error('Failed to update property amenity');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
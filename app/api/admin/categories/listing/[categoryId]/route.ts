import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function PATCH(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, icon, desc, needsMaxTenant, pricingType } = body;

    const category = await prisma.listingCategories.update({
      where: {
        id: params.categoryId
      },
      data: {
        title,
        icon,
        desc,
        needsMaxTenant,
        pricingType
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating listing category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
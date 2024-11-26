import { NextResponse } from 'next/server';
import  prisma  from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const categories = await prisma.roomCategories.findMany({
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching room categories:', error);
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
    const { title, icon, desc, needsMaxTenant } = body;

    const category = await prisma.roomCategories.create({
      data: {
        title,
        icon,
        desc,
        needsMaxTenant
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating room category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
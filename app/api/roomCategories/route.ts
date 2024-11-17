import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    const categories = await prisma.roomCategories.findMany({
      select: {
        id: true,
        title: true,
        icon: true,
        desc: true,
        needsMaxTenant: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching room categories:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchQuery = req.nextUrl.searchParams.get('search');
    
    if (!searchQuery || searchQuery.length < 3) {
      return NextResponse.json([]);
    }

    const availableUsers = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { phoneNumber: { contains: searchQuery, mode: 'insensitive' } },
        ],
        role: 'USER'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
      take: 10,
    });

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: "Failed to search users" }, 
      { status: 500 }
    );
  }
}
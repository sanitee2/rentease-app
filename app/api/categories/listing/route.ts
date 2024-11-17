import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    // Fetch categories from the database
    const categories = await prisma.listingCategories.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

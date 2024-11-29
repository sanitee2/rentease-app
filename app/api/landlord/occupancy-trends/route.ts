import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId: currentUser.id
      },
      include: {
        rooms: true,
        leaseContracts: {
          where: {
            isActive: true,
            startDate: {
              lte: new Date()
            }
          }
        }
      }
    });

    // Calculate occupancy trends
    // ... your existing calculations ...

    return NextResponse.json(listings);
  } catch (error) {
    console.error("[OCCUPANCY_TRENDS]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leases = await prisma.leaseContract.findMany({
      where: {
        listing: {
          userId: currentUser.id
        }
      },
      select: {
        id: true,
        startDate: true,
        endedAt: true,
        rentAmount: true,
        isActive: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        startDate: "desc"
      },
      take: 5
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error("[RECENT_LEASES]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 
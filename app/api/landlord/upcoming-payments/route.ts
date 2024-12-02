import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          listing: { userId: currentUser.id }
        },
        status: 'PENDING'
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        lease: {
          select: {
            id: true,
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
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 5
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('[UPCOMING_PAYMENTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
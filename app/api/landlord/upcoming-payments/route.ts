import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get upcoming payments from active lease contracts
    const upcomingPayments = await prisma.leaseContract.findMany({
      where: {
        listing: {
          userId: currentUser.id
        },
        endDate: {
          gt: new Date() // Only active leases
        }
      },
      select: {
        id: true,
        rentAmount: true,
        startDate: true,
        endDate: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 5 // Limit to 5 most recent
    });

    // Format the data for display
    const formattedPayments = upcomingPayments.map(payment => ({
      id: payment.id,
      amount: payment.rentAmount,
      dueDate: payment.startDate, // Using startDate as the due date
      tenant: {
        firstName: payment.user.firstName,
        lastName: payment.user.lastName
      },
      listing: {
        id: payment.listing.id,
        title: payment.listing.title
      }
    }));

    return NextResponse.json(formattedPayments);
    
  } catch (error) {
    console.error('[UPCOMING_PAYMENTS]', error);
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500 }
    );
  }
} 
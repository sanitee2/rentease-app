import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { leaseId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const leaseId = params.leaseId;

    // Get lease details with completed payments
    const lease = await prisma.leaseContract.findUnique({
      where: { id: leaseId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        monthlyDueDate: true,
        rentAmount: true,
        outstandingBalance: true,
        Payment: {
          where: { 
            status: 'COMPLETED',
          },
          select: {
            id: true,
            amount: true,
            createdAt: true,
            periodStart: true,
            periodEnd: true,
          },
          orderBy: {
            periodStart: 'asc'
          }
        },
      },
    });

    if (!lease) {
      return new NextResponse('Lease not found', { status: 404 });
    }

    return NextResponse.json({
      lease,
      payments: lease.Payment,
    });
  } catch (error) {
    console.error('[LEASE_PAYMENTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
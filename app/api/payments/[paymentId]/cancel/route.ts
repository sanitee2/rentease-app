import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PATCH(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: params.paymentId,
      },
      include: {
        user: true,
        lease: true,
      },
    });

    if (!payment) {
      return new NextResponse("Payment not found", { status: 404 });
    }

    // Verify that the current user owns this payment
    if (payment.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Verify that the payment is in PENDING status
    if (payment.status !== 'PENDING') {
      return new NextResponse("Only pending payments can be cancelled", { status: 400 });
    }

    // Update the payment status to CANCELLED
    const updatedPayment = await prisma.payment.update({
      where: {
        id: params.paymentId,
      },
      data: {
        status: 'CANCELLED',
      },
      include: {
        Listing: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    // If this payment was associated with a lease, update the outstanding balance
    if (payment.lease) {
      await prisma.leaseContract.update({
        where: {
          id: payment.lease.id,
        },
        data: {
          outstandingBalance: {
            increment: payment.amount
          }
        }
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('[PAYMENT_CANCEL]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
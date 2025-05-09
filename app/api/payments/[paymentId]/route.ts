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

    const body = await request.json();
    const { status, leaseId, amount, declineReason } = body;

    if (!params.paymentId) {
      return new NextResponse("Payment ID required", { status: 400 });
    }

    // Update payment with decline reason
    const updatedPayment = await prisma.payment.update({
      where: {
        id: params.paymentId
      },
      data: {
        status,
        declineReason: status === 'FAILED' ? declineReason : null
      },
      include: {
        user: true,
        lease: {
          include: {
            listing: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Update lease balance if payment is completed
    if (status === 'COMPLETED') {
      await prisma.leaseContract.update({
        where: { id: leaseId },
        data: {
          outstandingBalance: {
            decrement: amount
          }
        }
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('PATCH /api/payments/[paymentId] error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
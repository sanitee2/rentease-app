import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function PATCH(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const body = await request.json();
    const { status, leaseId, amount } = body;

    if (!params.paymentId) {
      return new NextResponse("Payment ID required", { status: 400 });
    }

    // Update payment with related data
    const payment = await prisma.payment.update({
      where: {
        id: params.paymentId,
      },
      data: {
        status,
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

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment update error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
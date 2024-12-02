import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const {
      leaseId,
      listingId,
      landlordId,
      roomId,
      amount,
      mode,
      proofImage,
      description,
      periodStart,
      periodEnd
    } = body;

    // Validate required fields
    if (!leaseId || !listingId || !landlordId || !amount || !mode) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // First get the lease to get the listingId
    const lease = await prisma.leaseContract.findUnique({
      where: { id: leaseId },
      select: { listingId: true }
    });

    if (!lease) {
      return new NextResponse('Lease not found', { status: 404 });
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        userId: currentUser.id,
        leaseId: body.leaseId,
        amount: body.amount,
        image: body.proofImage,
        description: body.description,
        paymentMethod: body.mode,
        listingId: body.listingId,
        roomId: body.roomId,
        periodStart: body.periodStart ? new Date(body.periodStart) : null,
        periodEnd: body.periodEnd ? new Date(body.periodEnd) : null,
        status: 'PENDING',
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('[PAYMENTS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
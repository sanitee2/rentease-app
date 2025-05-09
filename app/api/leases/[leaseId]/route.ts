import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PATCH(
  request: Request,
  { params }: { params: { leaseId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { status } = body;

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.leaseId) {
      return new NextResponse("Lease ID is required", { status: 400 });
    }

    // Validate status
    if (!['ACTIVE', 'REJECTED'].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Update lease contract
    const updatedLease = await prisma.leaseContract.update({
      where: {
        id: params.leaseId,
      },
      data: {
        status: status as 'ACTIVE' | 'REJECTED',
      },
      include: {
        listing: true,
        room: true,
      }
    });

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error('[LEASE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
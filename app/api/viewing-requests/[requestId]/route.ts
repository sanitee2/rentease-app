import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { sendViewingRequestNotification } from "@/app/notifications/actions/sendViewingRequestNotification";

export async function PATCH(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status, declineReason } = body;

    if (!params.requestId) {
      return new NextResponse("Request ID required", { status: 400 });
    }

    // Update viewing request status with decline reason
    const updatedRequest = await prisma.requestViewing.update({
      where: {
        id: params.requestId
      },
      data: {
        status,
        declineReason: status === 'DECLINED' ? declineReason : null // Only set decline reason if status is DECLINED
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        listing: {
          select: {
            title: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        room: {
          select: {
            title: true
          }
        }
      }
    });

    // Send notification with decline reason if status is DECLINED
    await sendViewingRequestNotification({
      email: updatedRequest.user.email,
      phone: updatedRequest.user.phoneNumber,
      name: `${updatedRequest.user.firstName} ${updatedRequest.user.lastName}`,
      status,
      propertyName: updatedRequest.listing.title,
      roomName: updatedRequest.room?.title,
      landlordName: `${updatedRequest.listing.user.firstName} ${updatedRequest.listing.user.lastName}`,
      viewingDate: updatedRequest.date,
      viewingTime: updatedRequest.time,
      declineReason: status === 'DECLINED' ? declineReason : undefined
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('PATCH /api/viewing-requests/[requestId] error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
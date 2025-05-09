import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function PATCH(
  request: Request,
  { params }: { params: { maintenanceId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: params.maintenanceId
      },
      data: {
        status
      }
    });

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('[MAINTENANCE_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title,
      description,
      priority,
      images,
      listingId,
      roomId
    } = body;

    // Validate required fields
    if (!title || !description || !priority || !listingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create maintenance request
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        priority,
        images,
        listingId,
        roomId,
        userId: currentUser.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('[MAINTENANCE_POST]', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        listing: {
          userId: currentUser.id
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            image: true
          }
        },
        listing: {
          select: {
            title: true
          }
        },
        room: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the response to match the expected interface
    const formattedRequests = maintenanceRequests.map(request => ({
      ...request,
      tenant: request.user // Map user to tenant for frontend compatibility
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('[MAINTENANCE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
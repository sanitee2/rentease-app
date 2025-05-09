import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { listingId } = params;

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: {
        listingId: listingId
      },
      include: {
        tenants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            pricingType: true
          }
        },
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    });

    const roomsWithTenantCount = rooms.map(room => ({
      ...room,
      currentTenantCount: room.tenants.length,
      isAtCapacity: room.maxTenantCount ? room.tenants.length >= room.maxTenantCount : false
    }));

    return NextResponse.json(roomsWithTenantCount);
  } catch (error) {
    console.error('[ROOMS_GET]', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
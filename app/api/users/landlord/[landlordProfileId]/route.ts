import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { landlordProfileId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: {
        id: params.landlordProfileId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            image: true,
            role: true,
            favoriteIds: true,
            createdAt: true,
            updatedAt: true,
            emailVerified: true,
            hashedPassword: true,
            middleName: true,
            suffix: true,
          }
        }
      }
    });

    if (!landlordProfile) {
      return new NextResponse("Landlord not found", { status: 404 });
    }

    const safeUser = {
      ...landlordProfile.user,
      createdAt: landlordProfile.user.createdAt.toISOString(),
      updatedAt: landlordProfile.user.updatedAt.toISOString(),
      emailVerified: landlordProfile.user.emailVerified?.toISOString() || null,
    };

    return NextResponse.json({
      phoneNumber: landlordProfile.phoneNumber,
      user: safeUser
    });
  } catch (error) {
    console.error('[LANDLORD_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
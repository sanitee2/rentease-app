import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify current user has permission
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'LANDLORD')) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Try to find existing tenant profile
    let tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId }
    });

    // If no profile exists, create one
    if (!tenantProfile) {
      tenantProfile = await prisma.tenantProfile.create({
        data: {
          userId,
          favoriteIds: []
        }
      });
    }

    return NextResponse.json(tenantProfile);
  } catch (error: any) {
    console.error('GET /api/users/[userId]/tenant-profile error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 
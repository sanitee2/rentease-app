import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(
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

    // Check if tenant profile already exists
    const existingProfile = await prisma.tenantProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Tenant profile already exists" },
        { status: 409 }
      );
    }

    // Create new tenant profile
    const tenantProfile = await prisma.tenantProfile.create({
      data: {
        userId,
        favoriteIds: []
      }
    });

    return NextResponse.json(tenantProfile);
  } catch (error: any) {
    console.error('POST /api/users/[userId]/tenant-profile error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
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

    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId }
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: "Tenant profile not found" },
        { status: 404 }
      );
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
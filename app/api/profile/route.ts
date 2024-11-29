import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function PUT(
  request: Request,
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      email,
      phoneNumber,
      image,
    } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        firstName,
        middleName,
        lastName,
        suffix,
        email,
        phoneNumber,
        image,
        landlord: {
          update: {
            phoneNumber,
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PROFILE_UPDATE_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 
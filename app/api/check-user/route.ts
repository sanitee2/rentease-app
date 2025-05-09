import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    const existingFields = {
      email: false,
      phoneNumber: false
    };

    if (email) {
      const emailUser = await prisma.user.findUnique({
        where: { email }
      });
      if (emailUser) {
        existingFields.email = true;
      }
    }

    if (phoneNumber) {
      const phoneUser = await prisma.user.findFirst({
        where: { phoneNumber }
      });
      if (phoneUser) {
        existingFields.phoneNumber = true;
      }
    }

    return NextResponse.json({
      exists: existingFields.email || existingFields.phoneNumber,
      existingFields
    });

  } catch (error) {
    console.error('CHECK USER ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
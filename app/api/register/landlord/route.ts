import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      middleName,
      lastName,
      suffix,
      password,
      phoneNumber,
      image,
    } = body;

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with landlord role and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user first
      const newUser = await tx.user.create({
        data: {
          email,
          firstName,
          middleName,
          lastName,
          suffix,
          hashedPassword,
          phoneNumber,
          image,
          role: 'LANDLORD',
          // Create the landlord profile at the same time
          landlord: {
            create: {
              phoneNumber,
            }
          }
        },
        include: {
          landlord: true
        }
      });

      return newUser;
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('LANDLORD_REGISTRATION_ERROR:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create landlord account' },
      { status: 500 }
    );
  }
} 
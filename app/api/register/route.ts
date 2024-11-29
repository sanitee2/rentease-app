import bcrypt from 'bcrypt'

import prisma from '@/app/libs/prismadb'
import { NextResponse } from 'next/server';

export async function POST(
  request: Request
) {
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
      role = 'USER'
    } = body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        middleName,
        lastName,
        suffix,
        hashedPassword,
        phoneNumber,
        image,
        role,
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('REGISTRATION_ERROR:', error);
    
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

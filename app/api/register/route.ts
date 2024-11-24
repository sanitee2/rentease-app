import bcrypt from 'bcrypt'

import prisma from '@/app/libs/prismadb'
import { NextResponse } from 'next/server';

export async function POST(
  request: Request
) {
  const body = await request.json();
  const {
    email,
    firstName,
    middleName,
    lastName,
    suffix,
    password,
    role,
    phoneNumber,
    image
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
      role,
      image,
      phoneNumber,
      ...(role === 'TENANT' && {
        tenant: {
          create: {}
        }
      }),
      ...(role === 'LANDLORD' && {
        landlord: {
          create: {
            phoneNumber
          }
        }
      }),
      ...(role === 'ADMIN' && {
        admin: {
          create: {}
        }
      })
    },
    include: {
      tenant: true,
      landlord: true,
      admin: true
    }
  });
  
  return NextResponse.json(user);
}

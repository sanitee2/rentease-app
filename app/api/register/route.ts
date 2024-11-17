import bcrypt from 'bcrypt'

import prisma from '@/app/libs/prismadb'
import { NextResponse } from 'next/server';

export async function POST(
  request: Request
) {
  const body = await request.json();
  const {
    email,
    name,
    password,
    role,
    phoneNumber,
    image
  } = body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword,
      role,
      image,
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

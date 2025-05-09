import {getServerSession} from 'next-auth/next';
import { unstable_cache } from 'next/cache';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/app/libs/prismadb';

export async function getSession(){
  return await getServerSession(authOptions);
}

// Cache the database query for 5 minutes
const getCachedUser = unstable_cache(
  async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return null;

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      emailVerified: user.emailVerified?.toISOString() || null,
      role: user.role
    };
  },
  ['user-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['user-data']
  }
);

export default async function getCurrentUser(){
  try {
    const session = await getSession();
    if(!session?.user?.email){
      return null;
    }

    return getCachedUser(session.user.email);
  } catch (error: any) {
    return null;
  }
}
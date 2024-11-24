import prisma from "@/app/libs/prismadb";

export default async function getAvailableUsers() {
  try {
    return await prisma.user.findMany({
      where: {
        role: 'USER'  // Only get users with role USER
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });
  } catch (error: any) {
    throw new Error(error);
  }
}

// getRooms.ts
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId: string;
}

export default async function getRooms({ listingId }: IParams) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        listingId: listingId,
      },
    });

    if (!rooms) {
      return [];
    }

    return rooms.map((room) => ({
      ...room,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

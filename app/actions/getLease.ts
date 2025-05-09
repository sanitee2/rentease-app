import prisma from "@/app/libs/prismadb";

export interface LeaseData {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'CANCELLED';
  rentAmount: number;
  startDate: Date;
  endDate: Date | null | undefined;
  leaseTerms: string;
  listing?: {
    id: string;
    title: string;
    description: string;
  };
}

export default async function getLease(userId?: string): Promise<LeaseData | null> {
  try {
    if (!userId) {
      return null;
    }

    const lease = await prisma.leaseContract.findFirst({
      where: {
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      },
      select: {
        id: true,
        status: true,
        rentAmount: true,
        startDate: true,
        endDate: true,
        leaseTerms: true,
        listing: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return lease;
  } catch (error: any) {
    console.error('getLease error:', error);
    return null;
  }
} 
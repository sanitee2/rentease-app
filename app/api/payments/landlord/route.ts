import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'LANDLORD') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          listing: {
            userId: currentUser.id
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            image: true,
          }
        },
        lease: {
          include: {
            listing: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            },
            room: {
              select: {
                title: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to ensure listing.user is always present
    const transformedPayments = payments.map(payment => ({
      ...payment,
      lease: {
        ...payment.lease,
        listing: {
          ...payment.lease.listing,
          user: payment.lease.listing.user || {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName
          }
        }
      }
    }));

    return NextResponse.json(transformedPayments);
  } catch (error) {
    console.error('[PAYMENTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
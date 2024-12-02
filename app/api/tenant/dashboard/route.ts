import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { TenantData } from '@/app/types';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get tenant profile with all related data
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { 
        userId: currentUser.id 
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            suffix: true,
            email: true,
            phoneNumber: true,
            image: true,
          }
        },
        leases: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
              }
            },
            Payment: {
              select: {
                id: true,
                amount: true,
                periodStart: true,
                periodEnd: true,
                status: true,
                createdAt: true,
                paymentMethod: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        currentRoom: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    if (!tenantProfile) {
      return new NextResponse('Tenant profile not found', { status: 404 });
    }

    const formattedData: TenantData = {
      id: tenantProfile.user.id,
      firstName: tenantProfile.user.firstName,
      middleName: tenantProfile.user.middleName,
      lastName: tenantProfile.user.lastName,
      suffix: tenantProfile.user.suffix,
      email: tenantProfile.user.email,
      phoneNumber: tenantProfile.user.phoneNumber,
      image: tenantProfile.user.image,
      tenant: {
        id: tenantProfile.id,
        currentRoom: tenantProfile.currentRoom ? {
          id: tenantProfile.currentRoom.id,
          title: tenantProfile.currentRoom.title,
        } : null,
      },
      leaseContracts: tenantProfile.leases.map(lease => ({
        id: lease.id,
        startDate: new Date(lease.startDate),
        endDate: lease.endDate ? new Date(lease.endDate) : null,
        rentAmount: Number(lease.rentAmount),
        monthlyDueDate: lease.monthlyDueDate,
        outstandingBalance: Number(lease.outstandingBalance),
        leaseTerms: lease.leaseTerms,
        status: lease.status,
        createdAt: lease.createdAt,
        listing: lease.listing ? {
          id: lease.listing.id,
          title: lease.listing.title,
        } : undefined,
        Payment: lease.Payment.map(payment => ({
          id: payment.id,
          amount: Number(payment.amount),
          status: payment.status,
          createdAt: payment.createdAt,
          paymentMethod: payment.paymentMethod || 'CASH',
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd
        }))
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('[DASHBOARD_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
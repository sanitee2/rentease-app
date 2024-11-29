import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

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
        // Include all related data based on schema relationships
        leases: {
          include: {
            listing: {
              include: {
                user: true
              }
            },
            payments: {
              orderBy: {
                date: 'desc'
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        payments: {
          orderBy: {
            date: 'desc'
          }
        },
        maintenance: {
          include: {
            listing: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        currentRoom: {
          include: {
            listing: true
          }
        }
      }
    });

    if (!tenantProfile) {
      return new NextResponse('Tenant profile not found', { status: 404 });
    }

    // Get current active lease
    const currentLease = tenantProfile.leases[0]; // Most recent lease

    // Calculate total paid from completed payments
    const totalPaid = tenantProfile.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Count active leases (not expired)
    const activeLeaseCount = tenantProfile.leases.filter(lease => 
      lease.endedAt && new Date(lease.endedAt) >= new Date()
    ).length;

    // Get host information from the current lease
    const host = currentLease?.listing?.user ? {
      id: currentLease.listing.user.id,
      name: currentLease.listing.user.firstName + ' ' + currentLease.listing.user.lastName,
      email: currentLease.listing.user.email,
      image: currentLease.listing.user.image,
      phone: currentLease.listing.user.phoneNumber || undefined
    } : null;

    // Format the response data
    const responseData = {
      leases: tenantProfile.leases.map(lease => ({
        ...lease,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endedAt ? lease.endedAt.toISOString() : null,
        createdAt: lease.createdAt.toISOString(),
      })),
      payments: tenantProfile.payments.map(payment => ({
        ...payment,
        date: payment.date.toISOString(),
      })),
      maintenanceRequests: tenantProfile.maintenance.map(request => ({
        ...request,
        createdAt: request.createdAt.toISOString(),
      })),
      currentLease: currentLease ? {
        ...currentLease,
        startDate: currentLease.startDate.toISOString(),
        endDate: currentLease.endedAt ? currentLease.endedAt.toISOString() : null,
        createdAt: currentLease.createdAt.toISOString(),
      } : null,
      currentRoom: tenantProfile.currentRoom,
      totalPaid,
      activeLeaseCount,
      host,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[DASHBOARD_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
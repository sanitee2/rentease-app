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
            listing: true,
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
      new Date(lease.endDate) >= new Date()
    ).length;

    // Format the response data
    const responseData = {
      leases: tenantProfile.leases.map(lease => ({
        ...lease,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate.toISOString(),
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
        endDate: currentLease.endDate.toISOString(),
        createdAt: currentLease.createdAt.toISOString(),
      } : null,
      currentRoom: tenantProfile.currentRoom,
      totalPaid,
      activeLeaseCount
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[DASHBOARD_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export async function getMaintenanceStats() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        total: 0,
        pending: 0,
        completed: 0
      };
    }

    // Get all maintenance requests for the landlord's listings
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        listing: {
          userId: currentUser.id
        }
      }
    });

    return {
      total: requests.length,
      pending: requests.filter(req => req.status === 'PENDING').length,
      completed: requests.filter(req => req.status === 'COMPLETED').length,
      inProgress: requests.filter(req => req.status === 'IN_PROGRESS').length,
      cancelled: requests.filter(req => req.status === 'CANCELLED').length,
      urgent: requests.filter(req => req.priority === 'URGENT').length,
      high: requests.filter(req => req.priority === 'HIGH').length
    };
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      inProgress: 0,
      cancelled: 0,
      urgent: 0,
      high: 0
    };
  }
} 
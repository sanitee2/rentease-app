import getCurrentUser from "@/app/actions/getCurrentUser";
import ViewingRequestsClient from "./ViewingRequestsClient";
import { redirect } from "next/navigation";
import prisma from "@/app/libs/prismadb";

const ViewingRequestsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch viewing requests for the landlord's listings
  const viewingRequests = await prisma.requestViewing.findMany({
    where: {
      listing: {
        userId: currentUser.id
      }
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          phoneNumber: true,
        }
      },
      listing: {
        select: {
          id: true,
          title: true,
          street: true,
          barangay: true,
        }
      },
      room: {
        select: {
          id: true,
          title: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <ViewingRequestsClient 
      currentUser={currentUser}
      initialRequests={viewingRequests}
    />
  );
};

export default ViewingRequestsPage; 
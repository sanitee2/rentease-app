import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ViewingRequestsClient from "./ViewingRequestsClient";
import prisma from "@/app/libs/prismadb";
import Footer from "@/app/components/Footer";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Viewing Requests - RentEase',
  description: 'Manage your viewing requests',
};

const ViewingRequestsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login to view your requests"
        />
      </ClientOnly>
    );
  }

  const requests = await prisma.requestViewing.findMany({
    where: {
      userId: currentUser.id
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      },
      room: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <ClientOnly>
      <ViewingRequestsClient requests={requests} />
      <Footer />
    </ClientOnly>
  );
};

export default ViewingRequestsPage; 
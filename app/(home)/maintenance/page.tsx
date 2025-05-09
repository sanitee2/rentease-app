import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import Container from "@/app/components/Container";
import prisma from "@/app/libs/prismadb";

import Footer from "@/app/components/Footer";
import MaintenanceClient from "./MaintenanceClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Maintenance - RentEase',
  description: 'Track all your maintenance requests',
};

const MaintenancePage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login to view your maintenance requests"
        />
      </ClientOnly>
    );
  }

  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where: {
      userId: currentUser.id
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true
        }
      },
      room: {
        select: {
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (maintenanceRequests.length === 0) {
    return (
      <ClientOnly>
        <div className="pt-10 pb-20">
          <Container>
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold">
                  Maintenance Requests
                </h1>
                <p className="text-neutral-500 mt-2">
                  Track all your maintenance requests
                </p>
              </div>
              
              <div className="flex items-center justify-center min-h-[60vh]">
                <EmptyState
                  title="No maintenance requests"
                  subtitle="You haven't submitted any maintenance requests yet."
                />
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <MaintenanceClient maintenanceRequests={maintenanceRequests} />
      <Footer />
    </ClientOnly>
  );
};

export default MaintenancePage; 
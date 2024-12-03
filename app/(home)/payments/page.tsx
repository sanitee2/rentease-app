import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import Container from "@/app/components/Container";
import prisma from "@/app/libs/prismadb";
import PaymentsClient from "./PaymentsClient";
import Footer from "@/app/components/Footer";


const PaymentsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login to view your payments"
        />
      </ClientOnly>
    );
  }

  const payments = await prisma.payment.findMany({
    where: {
      userId: currentUser.id
    },
    include: {
      lease: {
        include: {
          room: true,
          listing: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (payments.length === 0) {
    return (
      <ClientOnly>
        <div className="pt-10 pb-10">
          <Container>
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold">
                  Payment History
                </h1>
                <p className="text-neutral-500 mt-2">
                  View all your payment transactions
                </p>
              </div>
              
              <div className="flex items-center justify-center min-h-[60vh]">
                <EmptyState
                  title="No payments found"
                  subtitle="You haven't made any payments yet."
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
      <PaymentsClient payments={payments} />
      <Footer />
    </ClientOnly>
  );
};

export default PaymentsPage; 
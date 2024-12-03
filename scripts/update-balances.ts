import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateOutstandingBalances() {
  const today = new Date();
  
  try {
    // Get all active leases
    const activeLeases = await prisma.leaseContract.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        Payment: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    for (const lease of activeLeases) {
      // Skip if today is the lease start date
      const leaseStartDate = new Date(lease.startDate);
      if (
        leaseStartDate.getDate() === today.getDate() &&
        leaseStartDate.getMonth() === today.getMonth() &&
        leaseStartDate.getFullYear() === today.getFullYear()
      ) {
        console.log(`Skipping lease ${lease.id}: Today is the lease start date`);
        continue;
      }

      // Skip if lease hasn't started yet
      if (today < leaseStartDate) {
        console.log(`Skipping lease ${lease.id}: Lease hasn't started yet`);
        continue;
      }

      // Get the current month's due date
      const currentMonthDueDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        lease.monthlyDueDate
      );

      // If we're past the due date
      if (today > currentMonthDueDate) {
        // Calculate the payment period
        const periodStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          lease.monthlyDueDate
        );
        const periodEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          lease.monthlyDueDate
        );

        // Get payments made for this period
        const periodPayments = lease.Payment.filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= periodStart && paymentDate < periodEnd;
        });

        // Calculate total paid for this period
        const totalPaid = periodPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate the new balance considering advance payments
        let newBalance = lease.outstandingBalance;
        
        if (totalPaid < lease.rentAmount) {
          // If they haven't paid enough for this period
          newBalance += (lease.rentAmount - totalPaid);
        } else if (totalPaid > lease.rentAmount) {
          // If they paid more than required (advance payment)
          newBalance -= (totalPaid - lease.rentAmount);
        }
        
        // Only update if the balance has changed
        if (newBalance !== lease.outstandingBalance) {
          await prisma.leaseContract.update({
            where: { id: lease.id },
            data: { 
              outstandingBalance: newBalance
            }
          });

          console.log(`Updated lease ${lease.id}:`);
          console.log(`Previous balance: ${lease.outstandingBalance}`);
          console.log(`New balance: ${newBalance}`);
          console.log(`Period total paid: ${totalPaid}`);
          console.log(`Required rent: ${lease.rentAmount}`);
        }
      }
    }

    console.log('Successfully updated outstanding balances');
  } catch (error) {
    console.error('Error updating balances:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
updateOutstandingBalances()
  .catch(console.error);
import getCurrentUser from '@/app/actions/getCurrentUser';
import DashboardClient from './_components/DashboardClient';
import EmptyState from '@/app/components/EmptyState';
import { getDashboardData } from '@/app/actions/getDashboardData';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');  // Better UX to redirect to login page
  }

  try {
    // Fetch initial data server-side
    const dashboardData = await getDashboardData(currentUser.id);

    console.log(dashboardData);


    return (
      <DashboardClient 
        currentUser={currentUser}
        initialData={dashboardData || null}
      />
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return (
      <EmptyState
        title="Something went wrong"
        subtitle="Failed to load dashboard data. Please try again later."
      />
    );
  }
};

export default DashboardPage; 
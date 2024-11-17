import getCurrentUser from '@/app/actions/getCurrentUser';
import DashboardClient from './_components/DashboardClient';
import EmptyState from '@/app/components/EmptyState';

const DashboardPage = async () => {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return (
      <EmptyState
        title="Unauthorized"
        subtitle="Please login to access your dashboard"
      />
    );
  }

  return <DashboardClient currentUser={currentUser} />;
};

export default DashboardPage; 
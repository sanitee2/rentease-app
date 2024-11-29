import getCurrentUser from '@/app/actions/getCurrentUser';
import { redirect } from 'next/navigation';
import ProfileClient from './_components/ProfileClient';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import ProfileStats from './_components/ProfileStats';

const ProfilePage = async () => {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <Breadcrumbs />
          <ProfileStats currentUser={currentUser} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Your Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal information and account settings
            </p>
          </div>
          <ProfileClient currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
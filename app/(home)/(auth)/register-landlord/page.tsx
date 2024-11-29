import Footer from '@/app/components/Footer';
import { Metadata } from 'next';
import LandlordRegisterForm from './components/LandlordRegisterForm';

export const metadata: Metadata = {
  title: 'Register as Landlord - RentEase',
  description: 'Create your RentEase landlord account',
};

export default function RegisterLandlordPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create your RentEase Landlord Account
            </h1>
            <p className="mt-2 text-gray-600">
              Join our community of property owners and start managing your properties
            </p>
          </div>
          <LandlordRegisterForm />
        </div>
      </div>
      <Footer />
    </>
  );
} 